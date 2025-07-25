import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { FriendServices } from "./friend.service";

const sendFriendRequest = catchAsync(async (req, res) => {
  const senderId = (req.user as { userId: string })?.userId;
  const { targetUserId } = req.params;
  if (!targetUserId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Target user ID is required",
      data: null,
    });
  }
  const { message } = req.body;

  const result = await FriendServices.sendFriendRequestIntoDB(
    senderId,
    targetUserId,
    message
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Friend request sent successfully",
    data: result,
  });
});

const acceptFriendRequest = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { requestId } = req.params;
  if (!requestId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Request ID is required",
      data: null,
    });
  }
  const result = await FriendServices.acceptFriendRequestIntoDB(
    userId,
    requestId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Friend request accepted successfully",
    data: result,
  });
});

const rejectFriendRequest = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { requestId } = req.params;
  if (!requestId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Request ID is required",
      data: null,
    });
  }
  const result = await FriendServices.rejectFriendRequestIntoDB(
    userId,
    requestId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Friend request rejected successfully",
    data: result,
  });
});

const removeFriend = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { friendUserId } = req.params;
  if (!friendUserId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Friend user ID is required",
      data: null,
    });
  }
  const result = await FriendServices.removeFriendFromDB(userId, friendUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Friend removed successfully",
    data: result,
  });
});

const getFriendsList = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const result = await FriendServices.getFriendsListFromDB(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Friends list retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const getFriendRequests = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const result = await FriendServices.getFriendRequestsFromDB(
    userId,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Friend requests retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const getSentFriendRequests = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const result = await FriendServices.getSentFriendRequestsFromDB(
    userId,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Sent friend requests retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const getFriendSuggestions = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const limit = Number.parseInt(req.query.limit as string) || 10;
  const result = await FriendServices.getFriendSuggestionsFromDB(userId, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Friend suggestions retrieved successfully",
    data: result,
  });
});

export const FriendControllers = {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendsList,
  getFriendRequests,
  getSentFriendRequests,
  getFriendSuggestions,
};
