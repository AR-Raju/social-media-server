import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserServices } from "./user.service";

const updateProfile = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const result = await UserServices.updateUserProfileIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

const getUserProfile = catchAsync(async (req, res) => {
  const currentUserId = (req.user as { userId: string })?.userId;
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "User id is required",
      data: null,
    });
  }
  const result = await UserServices.getUserProfileFromDB(currentUserId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
});

const getUserFriends = catchAsync(async (req, res) => {
  const currentUserId = (req.user as { userId: string })?.userId;
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "User id is required",
      data: null,
    });
  }
  const result = await UserServices.getUserFriendsFromDB(
    currentUserId,
    id,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User friends retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const getUserGroups = catchAsync(async (req, res) => {
  const currentUserId = (req.user as { userId: string })?.userId;
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "User id is required",
      data: null,
    });
  }
  const result = await UserServices.getUserGroupsFromDB(
    currentUserId,
    id,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User groups retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const searchUsers = catchAsync(async (req, res) => {
  const result = await UserServices.searchUsersFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const blockUser = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { targetUserId } = req.params;
  if (!targetUserId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Target User id is required",
      data: null,
    });
  }
  const result = await UserServices.blockUserIntoDB(userId, targetUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const unblockUser = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { targetUserId } = req.params;
  if (!targetUserId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Target User id is required",
      data: null,
    });
  }
  const result = await UserServices.unblockUserIntoDB(userId, targetUserId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

export const UserControllers = {
  updateProfile,
  getUserProfile,
  getUserFriends,
  getUserGroups,
  searchUsers,
  blockUser,
  unblockUser,
};
