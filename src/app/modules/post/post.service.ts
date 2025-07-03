import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { SocketService } from "../../socket/socket.service";
import { Group } from "../group/group.model";
import { Notification } from "../notification/notification.model";
import { User } from "../user/user.model";
import type { TPost } from "./post.interface";
import { Comment, Post, Reaction } from "./post.model";

const PostSearchableFields = ["content", "tags"];

const createPostIntoDB = async (userId: string, postData: TPost) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // If posting to a group, verify membership
  if (postData.group) {
    const group = await Group.findById(postData.group);
    if (!group) {
      throw new AppError(httpStatus.NOT_FOUND, "Group not found");
    }

    if (!group.members.includes(userId) && group.admin.toString() !== userId) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You are not a member of this group"
      );
    }
  }

  const post = await Post.create({
    ...postData,
    author: userId,
  });

  // If posting to a group, add to group's posts
  if (postData.group) {
    await Group.findByIdAndUpdate(postData.group, {
      $push: { posts: post._id },
      $inc: { postCount: 1 },
    });
  }

  const populatedPost = await Post.findById(post._id)
    .populate("author", "name avatar")
    .populate("group", "name avatar type")
    .populate("sharedPost");

  // Send real-time post update
  await SocketService.sendPostUpdate({
    postId: post._id as string,
    authorId: userId,
    action: "create",
    data: populatedPost,
    timestamp: post.createdAt as Date,
  });

  return populatedPost;
};

const getAllPostsFromDB = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const user = await User.findById(userId).populate("friends");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Build feed query based on user's friends and groups
  const friendIds = user.friends.map((friend: any) => friend._id);
  const userGroups = user.groups;

  let feedQuery: any = {
    $or: [
      // User's own posts
      { author: userId },
      // Friends' posts with appropriate visibility
      {
        author: { $in: friendIds },
        visibility: { $in: ["public", "friends"] },
      },
      // Public posts
      { visibility: "public" },
      // Group posts where user is a member
      { group: { $in: userGroups } },
    ],
  };

  // Apply additional filters from query
  if (query.group) {
    feedQuery = { group: query.group };
  }

  if (query.author) {
    feedQuery = { author: query.author };
  }

  const postQuery = new QueryBuilder(
    Post.find(feedQuery)
      .populate("author", "name avatar isActive")
      .populate("group", "name avatar type")
      .populate("sharedPost")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name avatar",
        },
        options: { limit: 3, sort: { createdAt: -1 } },
      }),
    query
  )
    .search(PostSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await postQuery.modelQuery;
  const meta = await postQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSinglePostFromDB = async (userId: string, postId: string) => {
  const post = await Post.findById(postId)
    .populate("author", "name avatar isActive")
    .populate("group", "name avatar type")
    .populate("sharedPost")
    .populate({
      path: "comments",
      populate: {
        path: "author",
        select: "name avatar",
      },
      options: { sort: { createdAt: -1 } },
    });

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  // Check if user can view this post
  const canView = await canUserViewPost(userId, post);
  if (!canView) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to view this post"
    );
  }

  // Increment view count
  await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });

  return post;
};

const updatePostIntoDB = async (
  userId: string,
  postId: string,
  payload: Partial<TPost>
) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  if (post.author.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update your own posts"
    );
  }

  const updatedPost = await Post.findByIdAndUpdate(
    postId,
    {
      ...payload,
      isEdited: true,
      editedAt: new Date(),
    },
    { new: true, runValidators: true }
  )
    .populate("author", "name avatar")
    .populate("group", "name avatar type");

  return updatedPost;
};

const deletePostFromDB = async (userId: string, postId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  if (post.author.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only delete your own posts"
    );
  }

  // Delete associated comments and reactions
  await Comment.deleteMany({ post: postId });
  await Reaction.deleteMany({ target: postId, targetType: "post" });

  // Remove from group if it's a group post
  if (post.group) {
    await Group.findByIdAndUpdate(post.group, {
      $pull: { posts: postId },
      $inc: { postCount: -1 },
    });
  }

  await Post.findByIdAndDelete(postId);
  return post;
};

const reactToPostIntoDB = async (
  userId: string,
  postId: string,
  reactionType: string
) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  // Check if user can view this post
  const canView = await canUserViewPost(userId, post);
  if (!canView) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to react to this post"
    );
  }

  // Check if user already reacted
  const existingReaction = await Reaction.findOne({
    user: userId,
    target: postId,
    targetType: "post",
  });

  let result: any;

  if (existingReaction) {
    if (existingReaction.type === reactionType) {
      // Remove reaction if same type
      await Reaction.findByIdAndDelete(existingReaction._id);
      await Post.findByIdAndUpdate(postId, {
        $pull: { [`reactions.${reactionType}`]: userId },
      });
      result = { action: "removed", type: reactionType };
    } else {
      // Update reaction type
      await Reaction.findByIdAndUpdate(existingReaction._id, {
        type: reactionType,
      });
      await Post.findByIdAndUpdate(postId, {
        $pull: { [`reactions.${existingReaction.type}`]: userId },
        $push: { [`reactions.${reactionType}`]: userId },
      });
      result = {
        action: "updated",
        type: reactionType,
        oldType: existingReaction.type,
      };
    }
  } else {
    // Add new reaction
    await Reaction.create({
      user: userId,
      target: postId,
      targetType: "post",
      type: reactionType,
    });

    await Post.findByIdAndUpdate(postId, {
      $push: { [`reactions.${reactionType}`]: userId },
    });

    // Create notification for post author
    if (post.author.toString() !== userId) {
      await Notification.create({
        recipient: post.author,
        sender: userId,
        type: "post_reaction",
        title: "New Reaction",
        message: `Someone reacted to your post with ${reactionType}`,
        data: { postId },
      });
    }

    result = { action: "added", type: reactionType };
  }

  // Send real-time reaction update
  SocketService.sendPostReaction(postId, userId, reactionType, result.action);

  return result;
};

const addCommentToPostIntoDB = async (
  userId: string,
  postId: string,
  commentData: any
) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  // Check if user can view this post
  const canView = await canUserViewPost(userId, post);
  if (!canView) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to comment on this post"
    );
  }

  const comment = await Comment.create({
    ...commentData,
    post: postId,
    author: userId,
  });

  // Add comment to post
  await Post.findByIdAndUpdate(postId, {
    $push: { comments: comment._id },
  });

  // If it's a reply, add to parent comment
  if (commentData.parentComment) {
    await Comment.findByIdAndUpdate(commentData.parentComment, {
      $push: { replies: comment._id },
    });
  }

  // Create notification for post author
  if (post.author.toString() !== userId) {
    await Notification.create({
      recipient: post.author,
      sender: userId,
      type: "post_comment",
      title: "New Comment",
      message: "Someone commented on your post",
      data: { postId, commentId: comment._id },
    });
  }

  const populatedComment = await Comment.findById(comment._id).populate(
    "author",
    "name avatar"
  );

  // Send real-time comment update
  SocketService.sendPostComment(postId, populatedComment);

  return populatedComment;
};

const sharePostIntoDB = async (
  userId: string,
  postId: string,
  content?: string
) => {
  const originalPost = await Post.findById(postId);
  if (!originalPost) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  // Check if user can view this post
  const canView = await canUserViewPost(userId, originalPost);
  if (!canView) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to share this post"
    );
  }

  // Create shared post
  const sharedPost = await Post.create({
    author: userId,
    content: content || "",
    type: "shared",
    sharedPost: postId,
    visibility: "friends", // Default visibility for shared posts
  });

  // Add to original post's shares
  await Post.findByIdAndUpdate(postId, {
    $push: { shares: userId },
  });

  // Create notification for original post author
  if (originalPost.author.toString() !== userId) {
    await Notification.create({
      recipient: originalPost.author,
      sender: userId,
      type: "post_share",
      title: "Post Shared",
      message: "Someone shared your post",
      data: { postId },
    });
  }

  const populatedSharedPost = await Post.findById(sharedPost._id)
    .populate("author", "name avatar")
    .populate("sharedPost");

  return populatedSharedPost;
};

const getUserPostsFromDB = async (
  currentUserId: string,
  targetUserId: string,
  query: Record<string, unknown>
) => {
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check privacy settings
  const canViewPosts = await canUserViewUserPosts(currentUserId, targetUserId);
  if (!canViewPosts) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to view this user's posts"
    );
  }

  const postQuery = new QueryBuilder(
    Post.find({ author: targetUserId })
      .populate("author", "name avatar")
      .populate("group", "name avatar type")
      .populate("sharedPost"),
    query
  )
    .search(PostSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await postQuery.modelQuery;
  const meta = await postQuery.countTotal();

  return {
    meta,
    result,
  };
};

// Helper functions
const canUserViewPost = async (userId: string, post: any): Promise<boolean> => {
  if (post.visibility === "public") return true;
  if (post.author.toString() === userId) return true;

  if (post.visibility === "friends") {
    const user = await User.findById(userId);
    return user?.friends.includes(post.author) || false;
  }

  return false;
};

const canUserViewUserPosts = async (
  currentUserId: string,
  targetUserId: string
): Promise<boolean> => {
  if (currentUserId === targetUserId) return true;

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) return false;

  if (targetUser.privacy.postVisibility === "public") return true;
  if (targetUser.privacy.postVisibility === "friends") {
    return targetUser.friends.includes(currentUserId);
  }

  return false;
};

export const PostServices = {
  createPostIntoDB,
  getAllPostsFromDB,
  getSinglePostFromDB,
  updatePostIntoDB,
  deletePostFromDB,
  reactToPostIntoDB,
  addCommentToPostIntoDB,
  sharePostIntoDB,
  getUserPostsFromDB,
};
