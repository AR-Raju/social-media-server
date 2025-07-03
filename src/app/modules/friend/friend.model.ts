import { Schema, model } from "mongoose"
import type { TFriendRequest } from "./friend.interface"

const friendRequestSchema = new Schema<TFriendRequest>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
      maxlength: [200, "Message cannot exceed 200 characters"],
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
friendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true })
friendRequestSchema.index({ recipient: 1, status: 1 })
friendRequestSchema.index({ sender: 1, status: 1 })

export const FriendRequest = model<TFriendRequest>("FriendRequest", friendRequestSchema)
