import express from "express"
import auth from "../../middlewares/auth"
import validateRequest from "../../middlewares/validateRequest"
import { MessageControllers } from "./message.controller"
import { MessageValidation } from "./message.validation"

const router = express.Router()

// Message routes
router.post(
  "/send/:recipientId",
  auth(),
  validateRequest(MessageValidation.sendMessageValidationSchema),
  MessageControllers.sendMessage,
)

router.get("/conversations", auth(), MessageControllers.getConversations)

router.get("/:otherUserId", auth(), MessageControllers.getMessages)

export const MessageRoutes = router
