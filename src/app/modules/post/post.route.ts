import express from "express"
import auth from "../../middlewares/auth"
import validateRequest from "../../middlewares/validateRequest"
import { PostControllers } from "./post.controller"
import { PostValidation } from "./post.validation"

const router = express.Router()

// Post CRUD routes
router.post("/", auth(), validateRequest(PostValidation.createPostValidationSchema), PostControllers.createPost)

router.get("/", auth(), PostControllers.getAllPosts)

router.get("/:id", auth(), PostControllers.getSinglePost)

router.patch("/:id", auth(), validateRequest(PostValidation.updatePostValidationSchema), PostControllers.updatePost)

router.delete("/:id", auth(), PostControllers.deletePost)

// Post interaction routes
router.post(
  "/:id/react",
  auth(),
  validateRequest(PostValidation.reactToPostValidationSchema),
  PostControllers.reactToPost,
)

router.post(
  "/:id/comment",
  auth(),
  validateRequest(PostValidation.createCommentValidationSchema),
  PostControllers.addComment,
)

router.post("/:id/share", auth(), PostControllers.sharePost)

// User posts
router.get("/user/:userId", auth(), PostControllers.getUserPosts)

export const PostRoutes = router
