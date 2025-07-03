import express from "express";
import passport from "passport";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { USER_ROLE } from "../user/user.constant";
import { AuthControllers } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import "./passport.config"; // Initialize passport strategies

const router = express.Router();

// Regular auth routes
router.post(
  "/register",
  validateRequest(AuthValidation.registerValidationSchema),
  AuthControllers.registerUser
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.loginUser
);

// OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  AuthControllers.oauthSuccess
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  AuthControllers.oauthSuccess
);

// Protected routes
router.get("/me", auth(USER_ROLE.admin, USER_ROLE.user), AuthControllers.getMe);

router.post(
  "/change-password",
  auth(USER_ROLE.admin, USER_ROLE.user),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthControllers.changePassword
);

router.post("/refresh-token", AuthControllers.refreshToken);

router.post("/logout", AuthControllers.logout);

export const AuthRoutes = router;
