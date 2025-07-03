import { Schema, model } from "mongoose"
import type { TPost, TComment, TReaction } from "./post.interface"

const postSchema = new Schema<TPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      maxlength: [5000, "Content cannot exceed 5000 characters"],
    },
    images: [
      {
        type: String,
      },
    ],
    videos: [
      {
        type: String,
      },
    ],
    files: [
      {
        type: String,
      },
    ],
    type: {
      type: String,
      enum: ["text", "image", "video", "file", "shared"],
      default: "text",
    },
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "friends",
    },
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    sharedPost: {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
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
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    shares: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    tags: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
)

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
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    image: {
      type: String,
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
  },
  {
    timestamps: true,
  },
)

const reactionSchema = new Schema<TReaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    target: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    targetType: {
      type: String,
      required: true,
      enum: ["post", "comment"],
    },
    type: {
      type: String,
      required: true,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
postSchema.index({ author: 1, createdAt: -1 })
postSchema.index({ group: 1, createdAt: -1 })
postSchema.index({ visibility: 1 })
postSchema.index({ content: "text" })

commentSchema.index({ post: 1, createdAt: -1 })
commentSchema.index({ author: 1 })
commentSchema.index({ parentComment: 1 })

reactionSchema.index({ target: 1, targetType: 1 })
reactionSchema.index({ user: 1, target: 1, targetType: 1 }, { unique: true })

export const Post = model<TPost>("Post", postSchema)
export const Comment = model<TComment>("Comment", commentSchema)
export const Reaction = model<TReaction>("Reaction", reactionSchema)
