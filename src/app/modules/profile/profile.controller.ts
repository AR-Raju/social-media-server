import httpStatus from "http-status"
import catchAsync from "../../utils/catchAsync"
import sendResponse from "../../utils/sendResponse"
import { ProfileServices } from "./profile.service"

const getProfile = catchAsync(async (req, res) => {
  const result = await ProfileServices.getProfileFromDB()

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  })
})

const updateProfile = catchAsync(async (req, res) => {
  const result = await ProfileServices.updateProfileIntoDB(req.body)

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  })
})

export const ProfileControllers = {
  getProfile,
  updateProfile,
}
