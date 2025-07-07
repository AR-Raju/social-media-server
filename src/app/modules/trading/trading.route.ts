import express from "express"
import auth from "../../middlewares/auth"
import validateRequest from "../../middlewares/validateRequest"
import { USER_ROLE } from "../user/user.constant"
import { TradingControllers } from "./trading.controller"
import { TradingValidation } from "./trading.validation"

const router = express.Router()

// Trading listing CRUD routes
router.post(
  "/listings",
  auth(USER_ROLE.user),
  validateRequest(TradingValidation.createListingValidationSchema),
  TradingControllers.createListing,
)

router.get("/listings", TradingControllers.getAllListings)

router.get("/listings/my", auth(USER_ROLE.user), TradingControllers.getMyListings)

router.get("/listings/location/:location", TradingControllers.getListingsByLocation)

router.get("/listings/:id", auth(USER_ROLE.user), TradingControllers.getSingleListing)

router.patch(
  "/listings/:id",
  auth(USER_ROLE.user),
  validateRequest(TradingValidation.updateListingValidationSchema),
  TradingControllers.updateListing,
)

router.delete("/listings/:id", auth(USER_ROLE.user), TradingControllers.deleteListing)

// Trading listing interaction routes
router.post(
  "/listings/:id/contact",
  auth(USER_ROLE.user),
  validateRequest(TradingValidation.contactSellerValidationSchema),
  TradingControllers.contactSeller,
)

router.post("/listings/:id/sold", auth(USER_ROLE.user), TradingControllers.markAsSold)

router.post("/listings/:id/like", auth(USER_ROLE.user), TradingControllers.toggleLike)

router.get("/listings/:id/contacts", auth(USER_ROLE.user), TradingControllers.getListingContacts)

export const TradingRoutes = router
