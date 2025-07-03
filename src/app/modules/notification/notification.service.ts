import httpStatus from "http-status"
import QueryBuilder from "../../builder/QueryBuilder"
import AppError from "../../errors/AppError"
import type { TNotification } from "./notification.interface"
import { Notification } from "./notification.model"
import { SocketService } from "../../socket/socket.service"

const getNotificationsFromDB = async (userId: string, query: Record<string, unknown>) => {
  const notificationQuery = new QueryBuilder(
    Notification.find({ recipient: userId }).populate("sender", "name avatar").sort({ createdAt: -1 }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields()

  const result = await notificationQuery.modelQuery
  const meta = await notificationQuery.countTotal()

  // Get unread count
  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  })

  return {
    meta: {
      ...meta,
      unreadCount,
    },
    result,
  }
}

const markNotificationsAsReadIntoDB = async (userId: string, notificationIds?: string[], markAll?: boolean) => {
  const updateQuery: any = { recipient: userId }

  if (markAll) {
    updateQuery.isRead = false
  } else if (notificationIds && notificationIds.length > 0) {
    updateQuery._id = { $in: notificationIds }
  } else {
    throw new AppError(httpStatus.BAD_REQUEST, "Either provide notification IDs or set markAll to true")
  }

  const result = await Notification.updateMany(updateQuery, { isRead: true }, { new: true })

  return {
    message: `${result.modifiedCount} notifications marked as read`,
    modifiedCount: result.modifiedCount,
  }
}

const deleteNotificationFromDB = async (userId: string, notificationId: string) => {
  const notification = await Notification.findById(notificationId)
  if (!notification) {
    throw new AppError(httpStatus.NOT_FOUND, "Notification not found")
  }

  if (notification.recipient.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You can only delete your own notifications")
  }

  await Notification.findByIdAndDelete(notificationId)
  return notification
}

const createNotificationIntoDB = async (notificationData: TNotification) => {
  const notification = await Notification.create(notificationData)

  const populatedNotification = await Notification.findById(notification._id)
    .populate("sender", "name avatar")
    .populate("recipient", "name")

  // Send real-time notification
  await SocketService.sendNotification({
    notificationId: notification._id as string,
    recipientId: notificationData.recipient,
    senderId: notificationData.sender,
    type: notificationData.type,
    title: notificationData.title,
    message: notificationData.message,
    data: notificationData.data,
    timestamp: notification.createdAt as Date,
  })

  return populatedNotification
}

const getUnreadCountFromDB = async (userId: string) => {
  const count = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  })

  return { unreadCount: count }
}

export const NotificationServices = {
  getNotificationsFromDB,
  markNotificationsAsReadIntoDB,
  deleteNotificationFromDB,
  createNotificationIntoDB,
  getUnreadCountFromDB,
}
