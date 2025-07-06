import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MessageServices } from "./message.service";

const sendMessage = catchAsync(async (req, res) => {
  const senderId = (req.user as { userId: string })?.userId;
  const { recipientId } = req.params;
  if (!recipientId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Recipient ID is required",
      data: null,
    });
  }
  const result = await MessageServices.sendMessageIntoDB(
    senderId,
    recipientId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Message sent successfully",
    data: result,
  });
});

const getConversations = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const result = await MessageServices.getConversationsFromDB(
    userId,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Conversations retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const getMessages = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { otherUserId } = req.params;
  if (!otherUserId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Other user ID is required",
      data: null,
    });
  }
  const result = await MessageServices.getMessagesFromDB(
    userId,
    otherUserId,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Messages retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

export const MessageControllers = {
  sendMessage,
  getConversations,
  getMessages,
};
