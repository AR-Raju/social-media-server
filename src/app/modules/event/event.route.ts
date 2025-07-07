import express from "express"
import auth from "../../middlewares/auth"
import validateRequest from "../../middlewares/validateRequest"
import { USER_ROLE } from "../user/user.constant"
import { EventControllers } from "./event.controller"
import { EventValidation } from "./event.validation"

const router = express.Router()

// Event CRUD routes
router.post(
  "/",
  auth(USER_ROLE.user),
  validateRequest(EventValidation.createEventValidationSchema),
  EventControllers.createEvent,
)

router.get("/", EventControllers.getAllEvents)

router.get("/my", auth(USER_ROLE.user), EventControllers.getMyEvents)

router.get("/location/:location", EventControllers.getEventsByLocation)

router.get("/:id", auth(USER_ROLE.user), EventControllers.getSingleEvent)

router.patch(
  "/:id",
  auth(USER_ROLE.user),
  validateRequest(EventValidation.updateEventValidationSchema),
  EventControllers.updateEvent,
)

router.delete("/:id", auth(USER_ROLE.user), EventControllers.deleteEvent)

// Event interaction routes
router.post("/:id/join", auth(USER_ROLE.user), EventControllers.joinEvent)

router.post("/:id/leave", auth(USER_ROLE.user), EventControllers.leaveEvent)

router.get("/:id/attendees", auth(USER_ROLE.user), EventControllers.getEventAttendees)

export const EventRoutes = router
