import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import { PostControllers } from "./post.controller";
import { PostValidation } from "./post.validation";

const router = express.Router();

// Post CRUD routes
router.post(
  "/",
  auth(USER_ROLE.user),
  validateRequest(PostValidation.createPostValidationSchema),
  PostControllers.createPost
);

router.get("/", auth(USER_ROLE.user), PostControllers.getAllPosts);

router.get("/:id", auth(USER_ROLE.user), PostControllers.getSinglePost);

router.patch(
  "/:id",
  auth(USER_ROLE.user),
  validateRequest(PostValidation.updatePostValidationSchema),
  PostControllers.updatePost
);

router.delete("/:id", auth(USER_ROLE.user), PostControllers.deletePost);

// Post interaction routes
router.post(
  "/:id/react",
  auth(USER_ROLE.user),
  validateRequest(PostValidation.reactToPostValidationSchema),
  PostControllers.reactToPost
);

router.post(
  "/:id/comment",
  auth(USER_ROLE.user),
  validateRequest(PostValidation.createCommentValidationSchema),
  PostControllers.addComment
);

router.post("/:id/share", auth(USER_ROLE.user), PostControllers.sharePost);

// User posts
router.get("/user/:userId", auth(USER_ROLE.user), PostControllers.getUserPosts);

export const PostRoutes = router;
