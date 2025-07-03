import express from "express"
import auth from "../../middlewares/auth"
import validateRequest from "../../middlewares/validateRequest"
import { GroupControllers } from "./group.controller"
import { GroupValidation } from "./group.validation"

const router = express.Router()

// Group CRUD routes
router.post(
  "/create",
  auth(),
  validateRequest(GroupValidation.createGroupValidationSchema),
  GroupControllers.createGroup,
)

router.get("/", GroupControllers.getAllGroups)

router.get("/suggestions", auth(), GroupControllers.getGroupSuggestions)

router.get("/user", auth(), GroupControllers.getUserGroups)

router.get("/:groupId", auth(), GroupControllers.getSingleGroup)

router.patch(
  "/:groupId",
  auth(),
  validateRequest(GroupValidation.updateGroupValidationSchema),
  GroupControllers.updateGroup,
)

router.delete("/:groupId", auth(), GroupControllers.deleteGroup)

// Group membership routes
router.post("/:groupId/join", auth(), GroupControllers.joinGroup)

router.post("/:groupId/leave", auth(), GroupControllers.leaveGroup)

router.post("/:groupId/approve/:requestUserId", auth(), GroupControllers.approveJoinRequest)

// Group posts
router.get("/:groupId/posts", auth(), GroupControllers.getGroupPosts)

export const GroupRoutes = router
