import { Schema, model } from "mongoose"
import type { TMessage, TConversation } from "./message.interface"

const messageSchema = new Schema<TMessage>(
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
    content: {
      type: String,
      required: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    image: {
      type: String,
    },
    file: {
      type: String,
    },
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  },
)

const conversationSchema = new Schema<TConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 })
messageSchema.index({ recipient: 1, isRead: 1 })

conversationSchema.index({ participants: 1 })
conversationSchema.index({ lastMessageAt: -1 })

export const Message = model<TMessage>("Message", messageSchema)
export const Conversation = model<TConversation>("Conversation", conversationSchema)
