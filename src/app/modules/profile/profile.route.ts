import express from "express"
import auth from "../../middlewares/auth"
import validateRequest from "../../middlewares/validateRequest"
import { USER_ROLE } from "../user/user.constant"
import { ProfileControllers } from "./profile.controller"
import { ProfileValidation } from "./profile.validation"

const router = express.Router()

router.get("/", ProfileControllers.getProfile)

router.put(
  "/",
  auth(USER_ROLE.admin),
  validateRequest(ProfileValidation.updateProfileValidationSchema),
  ProfileControllers.updateProfile,
)

export const ProfileRoutes = router
