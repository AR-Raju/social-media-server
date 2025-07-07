import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import { SavedServices } from "./saved.service"

const saveItem = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { itemType, itemId } = req.params
  if (!itemType || !itemId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Item type and ID are required",
      data: null,
    })
  }
  const result = await SavedServices.saveItemIntoDB(userId, itemType, itemId)

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: result.message,
    data: result,
  })
})

const unsaveItem = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { itemType, itemId } = req.params
  if (!itemType || !itemId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Item type and ID are required",
      data: null,
    })
  }
  const result = await SavedServices.unsaveItemFromDB(userId, itemType, itemId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result,
  })
})

const getSavedPosts = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const result = await SavedServices.getSavedPostsFromDB(userId, req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Saved posts retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

const getSavedEvents = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const result = await SavedServices.getSavedEventsFromDB(userId, req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Saved events retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

const getSavedListings = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const result = await SavedServices.getSavedListingsFromDB(userId, req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Saved listings retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

const getAllSavedItems = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const result = await SavedServices.getAllSavedItemsFromDB(userId, req.query)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All saved items retrieved successfully",
    data: result.result,
    pagination: result.meta,
  })
})

const checkIfItemIsSaved = catchAsync(async (req, res) => {
  const userId = (req.user as { userId: string })?.userId
  const { itemType, itemId } = req.params
  if (!itemType || !itemId) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "Item type and ID are required",
      data: null,
    })
  }
  const result = await SavedServices.checkIfItemIsSavedFromDB(userId, itemType, itemId)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Item save status retrieved successfully",
    data: result,
  })
})

export const SavedControllers = {
  saveItem,
  unsaveItem,
  getSavedPosts,
  getSavedEvents,
  getSavedListings,
  getAllSavedItems,
  checkIfItemIsSaved,
}
