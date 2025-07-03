import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UploadServices } from "./upload.service";

const uploadImage = catchAsync(
  async (req: Request & { file?: Express.Multer.File }, res: Response) => {
    const result = await UploadServices.uploadImageToImageBB(
      req.file as Express.Multer.File
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Image uploaded successfully",
      data: result,
    });
  }
);

export const UploadControllers = {
  uploadImage,
};
