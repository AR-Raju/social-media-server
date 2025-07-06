import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { SocketService } from "../../socket/socket.service";
import { Notification } from "../notification/notification.model";
import { Post } from "../post/post.model";
import { User } from "../user/user.model";
import type { TComment } from "./comment.interface";
import { Comment, CommentReaction } from "./comment.model";

const CommentSearchableFields = ["content"];

const createCommentIntoDB = async (
  userId: string,
  postId: string,
  commentData: TComment
) => {
  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  // Check if user can comment on this post
  const canComment = await canUserCommentOnPost(userId, post);
  if (!canComment) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to comment on this post"
    );
  }

  // If it's a reply, check if parent comment exists
  if (commentData.parentComment) {
    const parentComment = await Comment.findById(commentData.parentComment);
    if (!parentComment) {
      throw new AppError(httpStatus.NOT_FOUND, "Parent comment not found");
    }
    if (parentComment.post.toString() !== postId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Parent comment does not belong to this post"
      );
    }
  }

  // Create comment
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

  // Create notification for post author (if not commenting on own post)
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

  // If it's a reply, notify parent comment author
  if (commentData.parentComment) {
    const parentComment = await Comment.findById(commentData.parentComment);
    if (parentComment && parentComment.author.toString() !== userId) {
      await Notification.create({
        recipient: parentComment.author,
        sender: userId,
        type: "post_comment",
        title: "New Reply",
        message: "Someone replied to your comment",
        data: {
          postId,
          commentId: comment._id,
          parentCommentId: commentData.parentComment,
        },
      });
    }
  }

  const populatedComment = await Comment.findById(comment._id)
    .populate("author", "name avatar")
    .populate("parentComment")
    .populate({
      path: "replies",
      populate: {
        path: "author",
        select: "name avatar",
      },
      options: { limit: 5, sort: { createdAt: 1 } },
    });

  // Send real-time comment update
  SocketService.sendPostComment(postId, populatedComment);

  return populatedComment;
};

const getPostCommentsFromDB = async (
  userId: string,
  postId: string,
  query: Record<string, unknown>
) => {
  // Check if post exists and user can view it
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, "Post not found");
  }

  const canView = await canUserViewPost(userId, post);
  if (!canView) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to view this post's comments"
    );
  }

  const commentQuery = new QueryBuilder(
    Comment.find({ post: postId, parentComment: { $exists: false } })
      .populate("author", "name avatar isActive")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "name avatar",
        },
        options: { limit: 5, sort: { createdAt: 1 } },
      })
      .sort({ createdAt: -1 }),
    query
  )
    .search(CommentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await commentQuery.modelQuery;
  const meta = await commentQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getCommentRepliesFromDB = async (
  userId: string,
  commentId: string,
  query: Record<string, unknown>
) => {
  // Check if comment exists
  const comment = await Comment.findById(commentId).populate("post");
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  // Check if user can view the post
  const canView = await canUserViewPost(userId, comment.post);
  if (!canView) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to view this comment's replies"
    );
  }

  const replyQuery = new QueryBuilder(
    Comment.find({ parentComment: commentId })
      .populate("author", "name avatar isActive")
      .sort({ createdAt: 1 }),
    query
  )
    .search(CommentSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await replyQuery.modelQuery;
  const meta = await replyQuery.countTotal();

  return {
    meta,
    result,
  };
};

const updateCommentIntoDB = async (
  userId: string,
  commentId: string,
  payload: Partial<TComment>
) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  if (comment.author.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only update your own comments"
    );
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      ...payload,
      isEdited: true,
      editedAt: new Date(),
    },
    { new: true, runValidators: true }
  )
    .populate("author", "name avatar")
    .populate({
      path: "replies",
      populate: {
        path: "author",
        select: "name avatar",
      },
      options: { limit: 5, sort: { createdAt: 1 } },
    });

  return updatedComment;
};

const deleteCommentFromDB = async (userId: string, commentId: string) => {
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  if (comment.author.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only delete your own comments"
    );
  }

  // Delete all replies to this comment
  await Comment.deleteMany({ parentComment: commentId });

  // Delete all reactions to this comment
  await CommentReaction.deleteMany({ comment: commentId });

  // Remove comment from post
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: commentId },
  });

  // Remove comment from parent comment if it's a reply
  if (comment.parentComment) {
    await Comment.findByIdAndUpdate(comment.parentComment, {
      $pull: { replies: commentId },
    });
  }

  await Comment.findByIdAndDelete(commentId);
  return comment;
};

const reactToCommentIntoDB = async (
  userId: string,
  commentId: string,
  reactionType: string
) => {
  const comment = await Comment.findById(commentId).populate("post");
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  // Check if user can view the post
  const canView = await canUserViewPost(userId, comment.post);
  if (!canView) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to react to this comment"
    );
  }

  // Check if user already reacted
  const existingReaction = await CommentReaction.findOne({
    user: userId,
    comment: commentId,
  });

  if (existingReaction) {
    if (existingReaction.type === reactionType) {
      // Remove reaction if same type
      await CommentReaction.findByIdAndDelete(existingReaction._id);
      await Comment.findByIdAndUpdate(commentId, {
        $pull: { [`reactions.${reactionType}`]: userId },
      });
      return { action: "removed", type: reactionType };
    } else {
      // Update reaction type
      await CommentReaction.findByIdAndUpdate(existingReaction._id, {
        type: reactionType,
      });
      await Comment.findByIdAndUpdate(commentId, {
        $pull: { [`reactions.${existingReaction.type}`]: userId },
        $push: { [`reactions.${reactionType}`]: userId },
      });
      return {
        action: "updated",
        type: reactionType,
        oldType: existingReaction.type,
      };
    }
  } else {
    // Add new reaction
    await CommentReaction.create({
      user: userId,
      comment: commentId,
      type: reactionType,
    });

    await Comment.findByIdAndUpdate(commentId, {
      $push: { [`reactions.${reactionType}`]: userId },
    });

    // Create notification for comment author
    if (comment.author.toString() !== userId) {
      await Notification.create({
        recipient: comment.author,
        sender: userId,
        type: "post_comment",
        title: "Comment Reaction",
        message: `Someone reacted to your comment with ${reactionType}`,
        data: {
          postId:
            typeof comment.post === "object" &&
            comment.post !== null &&
            "_id" in comment.post
              ? (comment.post as any)._id
              : comment.post,
          commentId,
        },
      });
    }

    return { action: "added", type: reactionType };
  }
};

const getSingleCommentFromDB = async (userId: string, commentId: string) => {
  const comment = await Comment.findById(commentId)
    .populate("author", "name avatar isActive")
    .populate("post", "author visibility")
    .populate({
      path: "replies",
      populate: {
        path: "author",
        select: "name avatar",
      },
      options: { sort: { createdAt: 1 } },
    });

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, "Comment not found");
  }

  // Check if user can view the post
  const canView = await canUserViewPost(userId, comment.post);
  if (!canView) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to view this comment"
    );
  }

  return comment;
};

// Helper functions
const canUserCommentOnPost = async (
  userId: string,
  post: any
): Promise<boolean> => {
  return canUserViewPost(userId, post);
};

const canUserViewPost = async (userId: string, post: any): Promise<boolean> => {
  if (post.visibility === "public") return true;
  if (post.author.toString() === userId) return true;

  if (post.visibility === "friends") {
    const user = await User.findById(userId);
    return user?.friends.includes(post.author) || false;
  }

  return false;
};

export const CommentServices = {
  createCommentIntoDB,
  getPostCommentsFromDB,
  getCommentRepliesFromDB,
  updateCommentIntoDB,
  deleteCommentFromDB,
  reactToCommentIntoDB,
  getSingleCommentFromDB,
};
