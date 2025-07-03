import httpStatus from "http-status"
import AppError from "../../errors/AppError"
import type { TProfile } from "./profile.interface"
import { Profile } from "./profile.model"

const getProfileFromDB = async () => {
  let profile = await Profile.findOne()

  if (!profile) {
    // Create default profile if none exists
    profile = await Profile.create({
      designation: "Software Developer",
      introduction: "Welcome to my portfolio!",
    })
  }

  return profile
}

const updateProfileIntoDB = async (payload: Partial<TProfile>) => {
  let profile = await Profile.findOne()

  if (!profile) {
    // Create new profile if none exists
    profile = await Profile.create(payload)
  } else {
    // Update existing profile
    profile = await Profile.findByIdAndUpdate(profile._id, payload, {
      new: true,
      runValidators: true,
    })
  }

  if (!profile) {
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to update profile")
  }

  return profile
}

export const ProfileServices = {
  getProfileFromDB,
  updateProfileIntoDB,
}
