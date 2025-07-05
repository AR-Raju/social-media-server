import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import { FriendControllers } from "./friend.controller";
import { FriendValidation } from "./friend.validation";

const router = express.Router();

// Friend request routes
router.post(
  "/request/:targetUserId",
  auth(USER_ROLE.user),
  validateRequest(FriendValidation.sendFriendRequestValidationSchema),
  FriendControllers.sendFriendRequest
);

router.post(
  "/accept/:requestId",
  auth(USER_ROLE.user),
  FriendControllers.acceptFriendRequest
);

router.post(
  "/reject/:requestId",
  auth(USER_ROLE.user),
  FriendControllers.rejectFriendRequest
);

router.delete(
  "/remove/:friendUserId",
  auth(USER_ROLE.user),
  FriendControllers.removeFriend
);

// Friend list routes
router.get("/list", auth(USER_ROLE.user), FriendControllers.getFriendsList);

router.get(
  "/requests",
  auth(USER_ROLE.user),
  FriendControllers.getFriendRequests
);

router.get(
  "/requests/sent",
  auth(USER_ROLE.user),
  FriendControllers.getSentFriendRequests
);

router.get(
  "/suggestions",
  auth(USER_ROLE.user),
  FriendControllers.getFriendSuggestions
);

export const FriendRoutes = router;
