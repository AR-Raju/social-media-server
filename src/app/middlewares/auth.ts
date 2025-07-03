import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import AppError from "../errors/AppError";
import type { TUserRole } from "../interface";
import { User } from "../modules/user/user.model";
import catchAsync from "../utils/catchAsync";

// Extend Express Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const token =
        req.cookies?.token || req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        throw new AppError(401, "You are not authorized!");
      }
      const decoded = jwt.verify(
        token,
        config.jwt_access_secret as string
      ) as JwtPayload;

      const { userId, role } = decoded;

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(404, "This user is not found!");
      }

      if (!user.isActive) {
        throw new AppError(403, "This user is blocked!");
      }

      if (requiredRoles && !requiredRoles.includes(role)) {
        throw new AppError(403, "You are not authorized!");
      }

      req.user = decoded as JwtPayload;
      next();
    }
  );
};

export default auth;
