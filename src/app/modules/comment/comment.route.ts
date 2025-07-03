import express from "express"
import auth from "../../middlewares/auth"
import validateRequest from "../../middlewares/validateRequest"
import { CommentControllers } from "./comment.controller"
import { CommentValidation } from "./comment.validation"

const router = express.Router()

// Comment CRUD routes
router.post(
  "/post/:postId",
  auth(),
  validateRequest(CommentValidation.createCommentValidationSchema),
  CommentControllers.createComment,
)

router.get("/post/:postId", auth(), CommentControllers.getPostComments)

router.get("/:commentId", auth(), CommentControllers.getSingleComment)

router.get("/:commentId/replies", auth(), CommentControllers.getCommentReplies)

router.patch(
  "/:commentId",
  auth(),
  validateRequest(CommentValidation.updateCommentValidationSchema),
  CommentControllers.updateComment,
)

router.delete("/:commentId", auth(), CommentControllers.deleteComment)

// Comment reaction routes
router.post(
  "/:commentId/react",
  auth(),
  validateRequest(CommentValidation.reactToCommentValidationSchema),
  CommentControllers.reactToComment,
)

export const CommentRoutes = router
