import { Schema, model, models } from "mongoose";
import type { TComment, TCommentReaction } from "./comment.interface";

const commentSchema = new Schema<TComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [2000, "Comment cannot exceed 2000 characters"],
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    reactions: {
      like: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      love: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      haha: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      wow: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      sad: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      angry: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    mentions: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    hashtags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const commentReactionSchema = new Schema<TCommentReaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ content: "text" });

commentReactionSchema.index({ comment: 1, user: 1 }, { unique: true });
commentReactionSchema.index({ user: 1 });

// Pre-save middleware to extract mentions and hashtags
commentSchema.pre("save", function (next) {
  if (this.content) {
    // Extract mentions (@username)
    const mentionRegex = /@(\w+)/g;
    const mentions = this.content.match(mentionRegex);
    if (mentions) {
      this.hashtags = mentions.map((mention) => mention.substring(1));
    }

    // Extract hashtags (#hashtag)
    const hashtagRegex = /#(\w+)/g;
    const hashtags = this.content.match(hashtagRegex);
    if (hashtags) {
      this.hashtags = hashtags.map((hashtag) => hashtag.substring(1));
    }
  }
  next();
});

export const Comment =
  models.Comment || model<TComment>("Comment", commentSchema);
export const CommentReaction =
  models.CommentReaction ||
  model<TCommentReaction>("CommentReaction", commentReactionSchema);
