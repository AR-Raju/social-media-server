import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ReactionServices } from "./reaction.service";

const addReaction = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { targetId, targetType } = req.params;
  if (!targetId || !targetType) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Target ID and type are required",
      data: null,
    });
  }
  const { type } = req.body;

  const result = await ReactionServices.addReactionIntoDB(
    userId,
    targetId,
    targetType as "post" | "comment",
    type
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Reaction ${result.action} successfully`,
    data: result,
  });
});

const getReactions = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { targetId, targetType } = req.params;
  if (!targetId || !targetType) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Target ID and type are required",
      data: null,
    });
  }
  const result = await ReactionServices.getReactionsFromDB(
    userId,
    targetId,
    targetType as "post" | "comment",
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reactions retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const getReactionSummary = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { targetId, targetType } = req.params;
  if (!targetId || !targetType) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Target ID and type are required",
      data: null,
    });
  }
  const result = await ReactionServices.getReactionSummaryFromDB(
    userId,
    targetId,
    targetType as "post" | "comment"
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reaction summary retrieved successfully",
    data: result,
  });
});

const getUserReactions = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const result = await ReactionServices.getUserReactionsFromDB(
    userId,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User reactions retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const removeReaction = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { targetId, targetType } = req.params;
  if (!targetId || !targetType) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Target ID and type are required",
      data: null,
    });
  }
  const result = await ReactionServices.removeReactionFromDB(
    userId,
    targetId,
    targetType as "post" | "comment"
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reaction removed successfully",
    data: result,
  });
});

export const ReactionControllers = {
  addReaction,
  getReactions,
  getReactionSummary,
  getUserReactions,
  removeReaction,
};
