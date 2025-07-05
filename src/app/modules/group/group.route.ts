import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import { GroupControllers } from "./group.controller";
import { GroupValidation } from "./group.validation";

const router = express.Router();

// Group CRUD routes
router.post(
  "/create",
  auth(USER_ROLE.user),
  validateRequest(GroupValidation.createGroupValidationSchema),
  GroupControllers.createGroup
);

router.get("/", GroupControllers.getAllGroups);

router.get(
  "/suggestions",
  auth(USER_ROLE.user),
  GroupControllers.getGroupSuggestions
);

router.get("/user", auth(USER_ROLE.user), GroupControllers.getUserGroups);

router.get("/:groupId", auth(USER_ROLE.user), GroupControllers.getSingleGroup);

router.patch(
  "/:groupId",
  auth(USER_ROLE.user),
  validateRequest(GroupValidation.updateGroupValidationSchema),
  GroupControllers.updateGroup
);

router.delete("/:groupId", auth(USER_ROLE.user), GroupControllers.deleteGroup);

// Group membership routes
router.post("/:groupId/join", auth(USER_ROLE.user), GroupControllers.joinGroup);

router.post(
  "/:groupId/leave",
  auth(USER_ROLE.user),
  GroupControllers.leaveGroup
);

router.post(
  "/:groupId/approve/:requestUserId",
  auth(USER_ROLE.user),
  GroupControllers.approveJoinRequest
);

// Group posts
router.get(
  "/:groupId/posts",
  auth(USER_ROLE.user),
  GroupControllers.getGroupPosts
);

export const GroupRoutes = router;
