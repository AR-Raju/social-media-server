import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import { MessageControllers } from "./message.controller";
import { MessageValidation } from "./message.validation";

const router = express.Router();

// Message routes
router.post(
  "/send/:recipientId",
  auth(USER_ROLE.user),
  validateRequest(MessageValidation.sendMessageValidationSchema),
  MessageControllers.sendMessage
);

router.get(
  "/conversations",
  auth(USER_ROLE.user),
  MessageControllers.getConversations
);

router.get(
  "/:otherUserId",
  auth(USER_ROLE.user),
  MessageControllers.getMessages
);

export const MessageRoutes = router;
