import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import { EventServices } from "./event.service"

const createEvent = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const result = await EventServices.createEventIntoDB(userId, req.body)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Event created successfully",
    data: result,
  })
})

const getAllEvents = catchAsync(async (req, res) => {
  const result = await EventServices.getAllEventsFromDB(req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Events retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

const getSingleEvent = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { id } = req.params
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Event ID is required",
      data: null,
    })
  }
  const result = await EventServices.getSingleEventFromDB(userId, id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event retrieved successfully",
    data: result,
  })
})

const updateEvent = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { id } = req.params
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Event ID is required",
      data: null,
    })
  }
  const result = await EventServices.updateEventIntoDB(userId, id, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event updated successfully",
    data: result,
  })
})

const deleteEvent = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { id } = req.params
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Event ID is required",
      data: null,
    })
  }
  const result = await EventServices.deleteEventFromDB(userId, id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event deleted successfully",
    data: result,
  })
})

const joinEvent = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { id } = req.params
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Event ID is required",
      data: null,
    })
  }
  const result = await EventServices.joinEventIntoDB(userId, id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  })
})

const leaveEvent = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { id } = req.params
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Event ID is required",
      data: null,
    })
  }
  const result = await EventServices.leaveEventIntoDB(userId, id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  })
})

const getEventAttendees = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { id } = req.params
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Event ID is required",
      data: null,
    })
  }
  const result = await EventServices.getEventAttendeesFromDB(userId, id, req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Event attendees retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

const getMyEvents = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const result = await EventServices.getMyEventsFromDB(userId, req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My events retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

const getEventsByLocation = catchAsync(async (req, res) => {
  const { location } = req.params
  if (!location) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Location is required",
      data: null,
    })
  }
  const result = await EventServices.getEventsByLocationFromDB(location, req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Events by location retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

export const EventControllers = {
  createEvent,
  getAllEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  getEventAttendees,
  getMyEvents,
  getEventsByLocation,
}
