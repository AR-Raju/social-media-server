import httpStatus from "http-status"
import QueryBuilder from "../../builder/QueryBuilder"
import AppError from "../../errors/AppError"
import { User } from "../user/user.model"
import { Notification } from "../notification/notification.model"
import { Message, Conversation } from "./message.model"
import { SocketService } from "../../socket/socket.service"

const sendMessageIntoDB = async (senderId: string, recipientId: string, messageData: any) => {
  // Check if recipient exists
  const recipient = await User.findById(recipientId)
  if (!recipient) {
    throw new AppError(httpStatus.NOT_FOUND, "Recipient not found")
  }

  // Check if sender is blocked by recipient
  if (recipient.blockedUsers.includes(senderId)) {
    throw new AppError(httpStatus.FORBIDDEN, "You are blocked by this user")
  }

  // Check if recipient is blocked by sender
  const sender = await User.findById(senderId)
  if (sender?.blockedUsers.includes(recipientId)) {
    throw new AppError(httpStatus.FORBIDDEN, "You have blocked this user")
  }

  // Create message
  const message = await Message.create({
    ...messageData,
    sender: senderId,
    recipient: recipientId,
  })

  // Find or create conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, recipientId] },
  })

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, recipientId],
      lastMessage: message._id,
      lastMessageAt: new Date(),
    })
  } else {
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
    })
  }

  // Create notification for recipient (only if they're offline)
  if (!SocketService.isUserOnline(recipientId)) {
    await Notification.create({
      recipient: recipientId,
      sender: senderId,
      type: "message",
      title: "New Message",
      message: `${sender?.name} sent you a message`,
      data: { messageId: message._id },
    })
  }

  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name avatar")
    .populate("recipient", "name avatar")
    .populate("replyTo")

  return populatedMessage
}

const getConversationsFromDB = async (userId: string, query: Record<string, unknown>) => {
  const conversationQuery = new QueryBuilder(
    Conversation.find({ participants: userId })
      .populate("participants", "name avatar isActive lastSeen")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields()

  const result = await conversationQuery.modelQuery
  const meta = await conversationQuery.countTotal()

  return {
    meta,
    result,
  }
}

const getMessagesFromDB = async (userId: string, otherUserId: string, query: Record<string, unknown>) => {
  // Check if other user exists
  const otherUser = await User.findById(otherUserId)
  if (!otherUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found")
  }

  // Check if users are blocked
  const user = await User.findById(userId)
  if (user?.blockedUsers.includes(otherUserId) || otherUser.blockedUsers.includes(userId)) {
    throw new AppError(httpStatus.FORBIDDEN, "Cannot view messages with blocked user")
  }

  const messageQuery = new QueryBuilder(
    Message.find({
      $or: [
        { sender: userId, recipient: otherUserId },
        { sender: otherUserId, recipient: userId },
      ],
    })
      .populate("sender", "name avatar")
      .populate("recipient", "name avatar")
      .populate("replyTo")
      .sort({ createdAt: -1 }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields()

  const result = await messageQuery.modelQuery
  const meta = await messageQuery.countTotal()

  // Mark messages as read
  await Message.updateMany(
    {
      sender: otherUserId,
      recipient: userId,
      isRead: false,
    },
    {
      $set: { isRead: true, readAt: new Date() },
    },
  )

  return {
    meta,
    result,
  }
}

export const MessageServices = {
  sendMessageIntoDB,
  getConversationsFromDB,
  getMessagesFromDB,
}
