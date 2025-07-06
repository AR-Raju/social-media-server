import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PostServices } from "./post.service";

const createPost = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const result = await PostServices.createPostIntoDB(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Post created successfully",
    data: result,
  });
});

const getAllPosts = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const result = await PostServices.getAllPostsFromDB(userId, req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Posts retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

const getSinglePost = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Post ID is required",
      data: null,
    });
  }
  const result = await PostServices.getSinglePostFromDB(userId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post retrieved successfully",
    data: result,
  });
});

const updatePost = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Post ID is required",
      data: null,
    });
  }
  const result = await PostServices.updatePostIntoDB(userId, id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post updated successfully",
    data: result,
  });
});

const deletePost = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Post ID is required",
      data: null,
    });
  }
  const result = await PostServices.deletePostFromDB(userId, id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Post deleted successfully",
    data: result,
  });
});

const reactToPost = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Post ID is required",
      data: null,
    });
  }
  const { type } = req.body;
  const result = await PostServices.reactToPostIntoDB(userId, id, type);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: `Reaction ${result.action} successfully`,
    data: result,
  });
});

const addComment = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Post ID is required",
      data: null,
    });
  }
  const result = await PostServices.addCommentToPostIntoDB(
    userId,
    id,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Comment added successfully",
    data: result,
  });
});

const sharePost = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId;
  const { id } = req.params;
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Post ID is required",
      data: null,
    });
  }
  const { content } = req.body;
  const result = await PostServices.sharePostIntoDB(userId, id, content);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Post shared successfully",
    data: result,
  });
});

const getUserPosts = catchAsync(async (req, res) => {
  const currentUserId = (req.user as { userId: string })?.userId;
  const { userId } = req.params;
  if (!userId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "User ID is required",
      data: null,
    });
  }
  const result = await PostServices.getUserPostsFromDB(
    currentUserId,
    userId,
    req.query
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User posts retrieved successfully",
    data: result.result,
    pagination: result.meta,
  });
});

export const PostControllers = {
  createPost,
  getAllPosts,
  getSinglePost,
  updatePost,
  deletePost,
  reactToPost,
  addComment,
  sharePost,
  getUserPosts,
};
