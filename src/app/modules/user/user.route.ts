import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "./user.constant";
import { UserControllers } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = express.Router();

// Profile routes
router.patch(
  "/me",
  auth(USER_ROLE.admin, USER_ROLE.user),
  validateRequest(UserValidation.updateUserValidationSchema),
  UserControllers.updateProfile
);

router.get("/search", UserControllers.searchUsers);

router.get(
  "/:id",
  auth(USER_ROLE.admin, USER_ROLE.user),
  UserControllers.getUserProfile
);

router.get(
  "/:id/friends",
  auth(USER_ROLE.admin, USER_ROLE.user),
  UserControllers.getUserFriends
);

router.get(
  "/:id/groups",
  auth(USER_ROLE.admin, USER_ROLE.user),
  UserControllers.getUserGroups
);

// Block/Unblock routes
router.post(
  "/block/:targetUserId",
  auth(USER_ROLE.admin, USER_ROLE.user),
  UserControllers.blockUser
);

router.post(
  "/unblock/:targetUserId",
  auth(USER_ROLE.admin, USER_ROLE.user),
  UserControllers.unblockUser
);

export const UserRoutes = router;
