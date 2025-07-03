import express from "express"
import auth from "../../middlewares/auth"
import validateRequest from "../../middlewares/validateRequest"
import { NotificationControllers } from "./notification.controller"
import { NotificationValidation } from "./notification.validation"

const router = express.Router()

router.get("/", auth(), NotificationControllers.getNotifications)

router.get("/unread-count", auth(), NotificationControllers.getUnreadCount)

router.patch(
  "/mark-read",
  auth(),
  validateRequest(NotificationValidation.markAsReadValidationSchema),
  NotificationControllers.markAsRead,
)

router.delete("/:id", auth(), NotificationControllers.deleteNotification)

export const NotificationRoutes = router
