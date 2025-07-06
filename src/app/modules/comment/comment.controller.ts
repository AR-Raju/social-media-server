import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CommentServices } from "./comment.service";

const createComment = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { postId } = req.params;
  if (!postId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Post ID is required",
      data: null,
    });
  }
  const result = await CommentServices.createCommentIntoDB(
    userId,
    postId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Comment created successfully",
    data: result,
  });
});

const getPostComments = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { postId } = req.params;
  if (!postId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Post ID is required",
      data: null,
    });
  }
  const result = await CommentServices.getPostCommentsFromDB(
    userId,
    postId,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comments retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const getCommentReplies = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { commentId } = req.params;
  if (!commentId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Comment ID is required",
      data: null,
    });
  }
  const result = await CommentServices.getCommentRepliesFromDB(
    userId,
    commentId,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment replies retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const getSingleComment = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { commentId } = req.params;
  if (!commentId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Comment ID is required",
      data: null,
    });
  }
  const result = await CommentServices.getSingleCommentFromDB(
    userId,
    commentId
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment retrieved successfully",
    data: result,
  });
});

const updateComment = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { commentId } = req.params;
  if (!commentId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Comment ID is required",
      data: null,
    });
  }
  const result = await CommentServices.updateCommentIntoDB(
    userId,
    commentId,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment updated successfully",
    data: result,
  });
});

const deleteComment = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { commentId } = req.params;
  if (!commentId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Comment ID is required",
      data: null,
    });
  }
  const result = await CommentServices.deleteCommentFromDB(userId, commentId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Comment deleted successfully",
    data: result,
  });
});

const reactToComment = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { commentId } = req.params;
  if (!commentId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Comment ID is required",
      data: null,
    });
  }
  const { type } = req.body;
  const result = await CommentServices.reactToCommentIntoDB(
    userId,
    commentId,
    type
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Comment reaction ${result.action} successfully`,
    data: result,
  });
});

export const CommentControllers = {
  createComment,
  getPostComments,
  getCommentReplies,
  getSingleComment,
  updateComment,
  deleteComment,
  reactToComment,
};
