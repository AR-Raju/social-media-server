import express from "express"
import auth from "../../middlewares/auth"
import validateRequest from "../../middlewares/validateRequest"
import { FriendControllers } from "./friend.controller"
import { FriendValidation } from "./friend.validation"

const router = express.Router()

// Friend request routes
router.post(
  "/request/:targetUserId",
  auth(),
  validateRequest(FriendValidation.sendFriendRequestValidationSchema),
  FriendControllers.sendFriendRequest,
)

router.post("/accept/:requestId", auth(), FriendControllers.acceptFriendRequest)

router.post("/reject/:requestId", auth(), FriendControllers.rejectFriendRequest)

router.delete("/remove/:friendUserId", auth(), FriendControllers.removeFriend)

// Friend list routes
router.get("/list", auth(), FriendControllers.getFriendsList)

router.get("/requests", auth(), FriendControllers.getFriendRequests)

router.get("/requests/sent", auth(), FriendControllers.getSentFriendRequests)

router.get("/suggestions", auth(), FriendControllers.getFriendSuggestions)

export const FriendRoutes = router
