import { Schema, model } from "mongoose"
import type { TNotification } from "./notification.interface"

const notificationSchema = new Schema<TNotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "friend_request",
        "friend_accept",
        "post_reaction",
        "post_comment",
        "post_share",
        "group_invite",
        "group_join",
        "message",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      postId: {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
      commentId: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
      groupId: {
        type: Schema.Types.ObjectId,
        ref: "Group",
      },
      messageId: {
        type: Schema.Types.ObjectId,
        ref: "Message",
      },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 })
notificationSchema.index({ isRead: 1 })

export const Notification = model<TNotification>("Notification", notificationSchema)
