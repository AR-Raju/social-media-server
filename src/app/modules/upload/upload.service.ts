import httpStatus from "http-status"
import config from "../../config"
import AppError from "../../errors/AppError"
import type { TUploadResponse } from "./upload.interface"
import type { Express } from "express"
import FormData from "form-data"
import fetch from "node-fetch"

const uploadImageToImageBB = async (file: Express.Multer.File): Promise<TUploadResponse> => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, "No file provided")
  }

  // Validate file type
  if (!file.mimetype.startsWith("image/")) {
    throw new AppError(httpStatus.BAD_REQUEST, "File must be an image")
  }

  // Validate file size (max 32MB for ImageBB)
  if (file.size > 32 * 1024 * 1024) {
    throw new AppError(httpStatus.BAD_REQUEST, "File size must be less than 32MB")
  }

  try {
    // Convert file to base64
    const base64 = file.buffer.toString("base64")

    // Upload to ImageBB
    const formData = new FormData()
    formData.append("image", base64)

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${config.image_bb_api_key}`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to upload to ImageBB")
    }

    const data = await response.json()

    if (!data.success) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, data.error?.message || "ImageBB upload failed")
    }

    return {
      success: true,
      url: data.data.url,
      deleteUrl: data.data.delete_url,
      filename: file.originalname,
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to upload file")
  }
}

export const UploadServices = {
  uploadImageToImageBB,
}
