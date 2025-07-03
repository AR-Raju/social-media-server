import { Schema, model } from "mongoose"
import type { TGroup } from "./group.interface"

const groupSchema = new Schema<TGroup>(
  {
    name: {
      type: String,
      required: [true, "Group name is required"],
      trim: true,
      maxlength: [100, "Group name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    avatar: {
      type: String,
      default: "/placeholder.svg?height=150&width=150",
    },
    coverPhoto: {
      type: String,
      default: "/placeholder.svg?height=400&width=800",
    },
    type: {
      type: String,
      enum: ["group", "page"],
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    privacy: {
      type: String,
      enum: ["public", "private", "secret"],
      default: "public",
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moderators: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    memberRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    bannedMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    rules: [
      {
        type: String,
      },
    ],
    tags: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
    },
    website: {
      type: String,
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    memberCount: {
      type: Number,
      default: 0,
    },
    postCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
groupSchema.index({ name: "text", description: "text" })
groupSchema.index({ type: 1, privacy: 1 })
groupSchema.index({ category: 1 })
groupSchema.index({ admin: 1 })
groupSchema.index({ members: 1 })

// Update member count when members change
groupSchema.pre("save", function (next) {
  this.memberCount = this.members.length
  next()
})

export const Group = model<TGroup>("Group", groupSchema)
