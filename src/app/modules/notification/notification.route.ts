import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import { NotificationControllers } from "./notification.controller";
import { NotificationValidation } from "./notification.validation";

const router = express.Router();

router.get("/", auth(USER_ROLE.user), NotificationControllers.getNotifications);

router.get(
  "/unread-count",
  auth(USER_ROLE.user),
  NotificationControllers.getUnreadCount
);

router.patch(
  "/mark-read",
  auth(USER_ROLE.user),
  validateRequest(NotificationValidation.markAsReadValidationSchema),
  NotificationControllers.markAsRead
);

router.delete(
  "/:id",
  auth(USER_ROLE.user),
  NotificationControllers.deleteNotification
);

export const NotificationRoutes = router;
