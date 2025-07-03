import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import { MessageServices } from "./message.service"

const sendMessage = catchAsync(async (req, res) => {
  const senderId = req.user?.userId
  const { recipientId } = req.params
  const result = await MessageServices.sendMessageIntoDB(senderId, recipientId, req.body)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Message sent successfully",
    data: result,
  })
})

const getConversations = catchAsync(async (req, res) => {
  const userId = req.user?.userId
  const result = await MessageServices.getConversationsFromDB(userId, req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversations retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

const getMessages = catchAsync(async (req, res) => {
  const userId = req.user?.userId
  const { otherUserId } = req.params
  const result = await MessageServices.getMessagesFromDB(userId, otherUserId, req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Messages retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

export const MessageControllers = {
  sendMessage,
  getConversations,
  getMessages,
}
