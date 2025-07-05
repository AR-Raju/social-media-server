import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import { ReactionControllers } from "./reaction.controller";
import { ReactionValidation } from "./reaction.validation";

const router = express.Router();

// Reaction routes
router.post(
  "/:targetType/:targetId",
  auth(USER_ROLE.user, USER_ROLE.admin),
  validateRequest(ReactionValidation.createReactionValidationSchema),
  ReactionControllers.addReaction
);

router.get(
  "/:targetType/:targetId",
  auth(USER_ROLE.user, USER_ROLE.admin),
  validateRequest(ReactionValidation.getReactionsValidationSchema),
  ReactionControllers.getReactions
);

router.get(
  "/:targetType/:targetId/summary",
  auth(USER_ROLE.user, USER_ROLE.admin),
  ReactionControllers.getReactionSummary
);

router.delete(
  "/:targetType/:targetId",
  auth(USER_ROLE.user, USER_ROLE.admin),
  ReactionControllers.removeReaction
);

// User reactions
router.get(
  "/user/me",
  auth(USER_ROLE.user, USER_ROLE.admin),
  ReactionControllers.getUserReactions
);

export const ReactionRoutes = router;
