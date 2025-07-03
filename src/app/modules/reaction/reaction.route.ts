import express from "express"
import auth from "../../middlewares/auth"
import validateRequest from "../../middlewares/validateRequest"
import { ReactionControllers } from "./reaction.controller"
import { ReactionValidation } from "./reaction.validation"

const router = express.Router()

// Reaction routes
router.post(
  "/:targetType/:targetId",
  auth(),
  validateRequest(ReactionValidation.createReactionValidationSchema),
  ReactionControllers.addReaction,
)

router.get(
  "/:targetType/:targetId",
  auth(),
  validateRequest(ReactionValidation.getReactionsValidationSchema),
  ReactionControllers.getReactions,
)

router.get("/:targetType/:targetId/summary", auth(), ReactionControllers.getReactionSummary)

router.delete("/:targetType/:targetId", auth(), ReactionControllers.removeReaction)

// User reactions
router.get("/user/me", auth(), ReactionControllers.getUserReactions)

export const ReactionRoutes = router
