import { Schema, model } from "mongoose";
import type { TProfile } from "./profile.interface";

const profileSchema = new Schema<TProfile>(
  {
    profilePicture: {
      type: String,
      default: "/placeholder.svg?height=400&width=400",
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
      maxlength: [100, "Designation cannot exceed 100 characters"],
    },
    introduction: {
      type: String,
      required: [true, "Introduction is required"],
      trim: true,
      maxlength: [2000, "Introduction cannot exceed 2000 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [500, "Address cannot exceed 500 characters"],
    },
    socialLinks: {
      linkedin: {
        type: String,
        trim: true,
        match: [
          /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+$/,
          "Please enter a valid LinkedIn URL",
        ],
      },
      github: {
        type: String,
        trim: true,
        match: [
          /^https?:\/\/(www\.)?github\.com\/[\w-]+$/,
          "Please enter a valid GitHub URL",
        ],
      },
      twitter: {
        type: String,
        trim: true,
        match: [
          /^https?:\/\/(www\.)?twitter\.com\/[\w-]+$/,
          "Please enter a valid Twitter URL",
        ],
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Profile = model<TProfile>("Profile", profileSchema);
