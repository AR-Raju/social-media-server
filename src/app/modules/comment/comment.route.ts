import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import { CommentControllers } from "./comment.controller";
import { CommentValidation } from "./comment.validation";

const router = express.Router();

// Comment CRUD routes
router.post(
  "/post/:postId",
  auth(USER_ROLE.user),
  validateRequest(CommentValidation.createCommentValidationSchema),
  CommentControllers.createComment
);

router.get(
  "/post/:postId",
  auth(USER_ROLE.user),
  CommentControllers.getPostComments
);

router.get(
  "/:commentId",
  auth(USER_ROLE.user),
  CommentControllers.getSingleComment
);

router.get(
  "/:commentId/replies",
  auth(USER_ROLE.user),
  CommentControllers.getCommentReplies
);

router.patch(
  "/:commentId",
  auth(USER_ROLE.user),
  validateRequest(CommentValidation.updateCommentValidationSchema),
  CommentControllers.updateComment
);

router.delete(
  "/:commentId",
  auth(USER_ROLE.user),
  CommentControllers.deleteComment
);

// Comment reaction routes
router.post(
  "/:commentId/react",
  auth(USER_ROLE.user),
  validateRequest(CommentValidation.reactToCommentValidationSchema),
  CommentControllers.reactToComment
);

export const CommentRoutes = router;
