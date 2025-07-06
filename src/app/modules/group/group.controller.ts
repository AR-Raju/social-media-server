import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { GroupServices } from "./group.service";

const createGroup = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const result = await GroupServices.createGroupIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Group created successfully",
    data: result,
  });
});

const getAllGroups = catchAsync(async (req, res) => {
  const result = await GroupServices.getAllGroupsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Groups retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const getSingleGroup = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { groupId } = req.params;
  if (!groupId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Group ID is required",
      data: null,
    });
  }
  const result = await GroupServices.getSingleGroupFromDB(userId, groupId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Group retrieved successfully",
    data: result,
  });
});

const updateGroup = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { groupId } = req.params;
  if (!groupId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Group ID is required",
      data: null,
    });
  }
  const result = await GroupServices.updateGroupIntoDB(
    userId,
    groupId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Group updated successfully",
    data: result,
  });
});

const deleteGroup = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { groupId } = req.params;
  if (!groupId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Group ID is required",
      data: null,
    });
  }
  const result = await GroupServices.deleteGroupFromDB(userId, groupId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Group deleted successfully",
    data: result,
  });
});

const joinGroup = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { groupId } = req.params;
  if (!groupId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Group ID is required",
      data: null,
    });
  }
  const result = await GroupServices.joinGroupIntoDB(userId, groupId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const leaveGroup = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { groupId } = req.params;
  if (!groupId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Group ID is required",
      data: null,
    });
  }
  const result = await GroupServices.leaveGroupIntoDB(userId, groupId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const getGroupPosts = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { groupId } = req.params;
  if (!groupId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Group ID is required",
      data: null,
    });
  }
  const result = await GroupServices.getGroupPostsFromDB(
    userId,
    groupId,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Group posts retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const getUserGroups = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const result = await GroupServices.getUserGroupsFromDB(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User groups retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const approveJoinRequest = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { groupId, requestUserId } = req.params;
  if (!groupId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Group ID is required",
      data: null,
    });
  }
  if (!requestUserId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Request User ID is required",
      data: null,
    });
  }
  const result = await GroupServices.approveJoinRequestIntoDB(
    userId,
    groupId,
    requestUserId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  });
});

const getGroupSuggestions = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const limit = Number.parseInt(req.query.limit as string) || 10;
  const result = await GroupServices.getGroupSuggestionsFromDB(userId, limit);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Group suggestions retrieved successfully",
    data: result,
  });
});

export const GroupControllers = {
  createGroup,
  getAllGroups,
  getSingleGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  leaveGroup,
  getGroupPosts,
  getUserGroups,
  approveJoinRequest,
  getGroupSuggestions,
};
