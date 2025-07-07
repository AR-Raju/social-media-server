import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import { TradingServices } from "./trading.service"

const createListing = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const result = await TradingServices.createListingIntoDB(userId, req.body)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Listing created successfully",
    data: result,
  })
})

const getAllListings = catchAsync(async (req, res) => {
  const result = await TradingServices.getAllListingsFromDB(req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listings retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

const getSingleListing = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { id } = req.params
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Listing ID is required",
      data: null,
    })
  }
  const result = await TradingServices.getSingleListingFromDB(userId, id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing retrieved successfully",
    data: result,
  })
})

const updateListing = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { id } = req.params
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Listing ID is required",
      data: null,
    })
  }
  const result = await TradingServices.updateListingIntoDB(userId, id, req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing updated successfully",
    data: result,
  })
})

const deleteListing = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { id } = req.params
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Listing ID is required",
      data: null,
    })
  }
  const result = await TradingServices.deleteListingFromDB(userId, id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing deleted successfully",
    data: result,
  })
})

const contactSeller = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { id } = req.params
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Listing ID is required",
      data: null,
    })
  }
  const { message } = req.body
  const result = await TradingServices.contactSellerIntoDB(userId, id, message)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  })
})

const markAsSold = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { id } = req.params
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Listing ID is required",
      data: null,
    })
  }
  const result = await TradingServices.markListingAsSoldIntoDB(userId, id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  })
})

const toggleLike = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { id } = req.params
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Listing ID is required",
      data: null,
    })
  }
  const result = await TradingServices.toggleListingLikeIntoDB(userId, id)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  })
})

const getMyListings = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const result = await TradingServices.getMyListingsFromDB(userId, req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My listings retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

const getListingsByLocation = catchAsync(async (req, res) => {
  const { location } = req.params
  if (!location) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Location is required",
      data: null,
    })
  }
  const result = await TradingServices.getListingsByLocationFromDB(location, req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listings by location retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

const getListingContacts = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { id } = req.params
  if (!id) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Listing ID is required",
      data: null,
    })
  }
  const result = await TradingServices.getListingContactsFromDB(userId, id, req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Listing contacts retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

export const TradingControllers = {
  createListing,
  getAllListings,
  getSingleListing,
  updateListing,
  deleteListing,
  contactSeller,
  markAsSold,
  toggleLike,
  getMyListings,
  getListingsByLocation,
  getListingContacts,
}
