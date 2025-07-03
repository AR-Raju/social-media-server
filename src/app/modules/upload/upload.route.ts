import express from "express"
import multer from "multer"
import { UploadControllers } from "./upload.controller"

const router = express.Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 32 * 1024 * 1024, // 32MB limit
  },
})

router.post("/", upload.single("image"), UploadControllers.uploadImage)

export const UploadRoutes = router
