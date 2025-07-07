import express from "express"
import auth from "../../middlewares/auth"
import validateRequest from "../../middlewares/validateRequest"
import { USER_ROLE } from "../user/user.constant"
import { SavedControllers } from "./saved.controller"
import { SavedValidation } from "./saved.validation"

const router = express.Router()

// Get all saved items (mixed)
router.get("/", auth(USER_ROLE.user), SavedControllers.getAllSavedItems)

// Get saved items by type
router.get("/posts", auth(USER_ROLE.user), SavedControllers.getSavedPosts)
router.get("/events", auth(USER_ROLE.user), SavedControllers.getSavedEvents)
router.get("/listings", auth(USER_ROLE.user), SavedControllers.getSavedListings)

// Save/unsave specific items
router.post(
  "/:itemType/:itemId",
  auth(USER_ROLE.user),
  validateRequest(SavedValidation.saveItemValidationSchema),
  SavedControllers.saveItem,
)

router.delete(
  "/:itemType/:itemId",
  auth(USER_ROLE.user),
  validateRequest(SavedValidation.saveItemValidationSchema),
  SavedControllers.unsaveItem,
)

// Check if item is saved
router.get(
  "/:itemType/:itemId/status",
  auth(USER_ROLE.user),
  validateRequest(SavedValidation.saveItemValidationSchema),
  SavedControllers.checkIfItemIsSaved,
)

export const SavedRoutes = router
