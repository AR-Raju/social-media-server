import express from "express";
import httpStatus from "http-status";
import auth from "../middlewares/auth";
import { SocketService } from "../socket/socket.service";
import catchAsync from "../utils/catchAsync";
import sendResponse from "../utils/sendResponse";

const router = express.Router();

// Get online users count
router.get(
  "/online-count",
  catchAsync(async (req, res) => {
    const count = SocketService.getOnlineUsersCount();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Online users count retrieved successfully",
      data: { count },
    });
  })
);

// Check if user is online
router.get(
  "/user/:userId/online",
  auth(),
  catchAsync(async (req, res) => {
    const { userId } = req.params;
    if (!userId) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: "User ID is required",
        data: null,
      });
    }
    const isOnline = SocketService.isUserOnline(userId);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User online status retrieved successfully",
      data: { userId, isOnline },
    });
  })
);

// Broadcast system message (admin only)
router.post(
  "/broadcast",
  auth(), // Add admin role check here
  catchAsync(async (req, res) => {
    const { message, type = "info" } = req.body;

    SocketService.broadcastSystemMessage(message, type);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "System message broadcasted successfully",
      data: { message, type },
    });
  })
);

export const SocketRoutes = router;
