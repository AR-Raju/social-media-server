import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { SocketService } from "../../socket/socket.service";
import { Comment } from "../comment/comment.model";
import { Notification } from "../notification/notification.model";
import { Post } from "../post/post.model";
import { User } from "../user/user.model";
import type { TReactionSummary } from "./reaction.interface";
import { Reaction } from "./reaction.model";

const addReactionIntoDB = async (
  userId: string,
  targetId: string,
  targetType: "post" | "comment",
  reactionType: string
) => {
  // Check if target exists
  let target: any;
  if (targetType === "post") {
    target = await Post.findById(targetId);
  } else {
    target = await Comment.findById(targetId).populate("post");
  }

  if (!target) {
    throw new AppError(httpStatus.NOT_FOUND, `${targetType} not found`);
  }

  // Check if user can react to this target
  const canReact = await canUserReactToTarget(userId, target, targetType);
  if (!canReact) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `You don't have permission to react to this ${targetType}`
    );
  }

  // Check if user already reacted
  const existingReaction = await Reaction.findOne({
    user: userId,
    target: targetId,
    targetType,
  });

  let result: any;

  if (existingReaction) {
    if (existingReaction.type === reactionType) {
      // Remove reaction if same type
      await Reaction.findByIdAndDelete(existingReaction._id);

      // Update target's reaction count
      if (targetType === "post") {
        await Post.findByIdAndUpdate(targetId, {
          $pull: { [`reactions.${reactionType}`]: userId },
        });
      } else {
        await Comment.findByIdAndUpdate(targetId, {
          $pull: { [`reactions.${reactionType}`]: userId },
        });
      }

      result = { action: "removed", type: reactionType };
    } else {
      // Update reaction type
      await Reaction.findByIdAndUpdate(existingReaction._id, {
        type: reactionType,
      });

      // Update target's reaction counts
      if (targetType === "post") {
        await Post.findByIdAndUpdate(targetId, {
          $pull: { [`reactions.${existingReaction.type}`]: userId },
          $push: { [`reactions.${reactionType}`]: userId },
        });
      } else {
        await Comment.findByIdAndUpdate(targetId, {
          $pull: { [`reactions.${existingReaction.type}`]: userId },
          $push: { [`reactions.${reactionType}`]: userId },
        });
      }

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
      target: targetId,
      targetType,
      type: reactionType,
    });

    // Update target's reaction count
    if (targetType === "post") {
      await Post.findByIdAndUpdate(targetId, {
        $push: { [`reactions.${reactionType}`]: userId },
      });
    } else {
      await Comment.findByIdAndUpdate(targetId, {
        $push: { [`reactions.${reactionType}`]: userId },
      });
    }

    // Create notification for target author
    const authorId = targetType === "post" ? target.author : target.author;
    if (authorId.toString() !== userId) {
      await Notification.create({
        recipient: authorId,
        sender: userId,
        type: targetType === "post" ? "post_reaction" : "post_comment",
        title: `${targetType === "post" ? "Post" : "Comment"} Reaction`,
        message: `Someone reacted to your ${targetType} with ${reactionType}`,
        data: {
          [targetType === "post" ? "postId" : "commentId"]: targetId,
          ...(targetType === "comment" && { postId: target.post._id }),
        },
      });
    }

    result = { action: "added", type: reactionType };
  }

  // Send real-time reaction update
  if (targetType === "post") {
    SocketService.sendPostReaction(
      targetId,
      userId,
      reactionType,
      result.action
    );
  }

  return result;
};

const getReactionsFromDB = async (
  userId: string,
  targetId: string,
  targetType: "post" | "comment",
  query: Record<string, unknown>
) => {
  // Check if target exists and user can view it
  let target: any;
  if (targetType === "post") {
    target = await Post.findById(targetId);
  } else {
    target = await Comment.findById(targetId).populate("post");
  }

  if (!target) {
    throw new AppError(httpStatus.NOT_FOUND, `${targetType} not found`);
  }

  const canView = await canUserViewTarget(userId, target, targetType);
  if (!canView) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `You don't have permission to view reactions on this ${targetType}`
    );
  }

  const reactionQuery = new QueryBuilder(
    Reaction.find({ target: targetId, targetType })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 }),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await reactionQuery.modelQuery;
  const meta = await reactionQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getReactionSummaryFromDB = async (
  userId: string,
  targetId: string,
  targetType: "post" | "comment"
): Promise<TReactionSummary> => {
  // Check if target exists and user can view it
  let target: any;
  if (targetType === "post") {
    target = await Post.findById(targetId);
  } else {
    target = await Comment.findById(targetId).populate("post");
  }

  if (!target) {
    throw new AppError(httpStatus.NOT_FOUND, `${targetType} not found`);
  }

  const canView = await canUserViewTarget(userId, target, targetType);
  if (!canView) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      `You don't have permission to view reactions on this ${targetType}`
    );
  }

  // Get reaction counts
  const reactionCounts = await Reaction.aggregate([
    { $match: { target: targetId, targetType } },
    { $group: { _id: "$type", count: { $sum: 1 } } },
  ]);

  const reactions = {
    like: 0,
    love: 0,
    haha: 0,
    wow: 0,
    sad: 0,
    angry: 0,
  };

  reactionCounts.forEach((reaction) => {
    reactions[reaction._id as keyof typeof reactions] = reaction.count;
  });

  const totalReactions = Object.values(reactions).reduce(
    (sum, count) => sum + count,
    0
  );

  // Get user's reaction
  const userReaction = await Reaction.findOne({
    user: userId,
    target: targetId,
    targetType,
  });

  return {
    targetId,
    targetType,
    reactions,
    totalReactions,
    userReaction: userReaction?.type,
  };
};

const getUserReactionsFromDB = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const reactionQuery = new QueryBuilder(
    Reaction.find({ user: userId })
      .populate("target")
      .populate("user", "name avatar")
      .sort({ createdAt: -1 }),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await reactionQuery.modelQuery;
  const meta = await reactionQuery.countTotal();

  return {
    meta,
    result,
  };
};

const removeReactionFromDB = async (
  userId: string,
  targetId: string,
  targetType: "post" | "comment"
) => {
  const reaction = await Reaction.findOne({
    user: userId,
    target: targetId,
    targetType,
  });

  if (!reaction) {
    throw new AppError(httpStatus.NOT_FOUND, "Reaction not found");
  }

  await Reaction.findByIdAndDelete(reaction._id);

  // Update target's reaction count
  if (targetType === "post") {
    await Post.findByIdAndUpdate(targetId, {
      $pull: { [`reactions.${reaction.type}`]: userId },
    });
  } else {
    await Comment.findByIdAndUpdate(targetId, {
      $pull: { [`reactions.${reaction.type}`]: userId },
    });
  }

  return { action: "removed", type: reaction.type };
};

// Helper functions
const canUserReactToTarget = async (
  userId: string,
  target: any,
  targetType: "post" | "comment"
): Promise<boolean> => {
  if (targetType === "post") {
    return canUserViewPost(userId, target);
  } else {
    return canUserViewPost(userId, target.post);
  }
};

const canUserViewTarget = async (
  userId: string,
  target: any,
  targetType: "post" | "comment"
): Promise<boolean> => {
  if (targetType === "post") {
    return canUserViewPost(userId, target);
  } else {
    return canUserViewPost(userId, target.post);
  }
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

export const ReactionServices = {
  addReactionIntoDB,
  getReactionsFromDB,
  getReactionSummaryFromDB,
  getUserReactionsFromDB,
  removeReactionFromDB,
};
