import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import { NotificationServices } from "./notification.service"

const getNotifications = catchAsync(async (req, res) => {
  const userId = req.user?.userId
  const result = await NotificationServices.getNotificationsFromDB(userId, req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notifications retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

const markAsRead = catchAsync(async (req, res) => {
  const userId = req.user?.userId
  const { notificationIds, markAll } = req.body
  const result = await NotificationServices.markNotificationsAsReadIntoDB(userId, notificationIds, markAll)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  })
})

const deleteNotification = catchAsync(async (req, res) => {
  const userId = req.user?.userId
  const { id } = req.params
  const result = await NotificationServices.deleteNotificationFromDB(userId, id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Notification deleted successfully",
    data: result,
  })
})

const getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.user?.userId
  const result = await NotificationServices.getUnreadCountFromDB(userId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Unread count retrieved successfully",
    data: result,
  })
})

export const NotificationControllers = {
  getNotifications,
  markAsRead,
  deleteNotification,
  getUnreadCount,
}
