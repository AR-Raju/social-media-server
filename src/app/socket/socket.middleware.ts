import jwt from "jsonwebtoken";
import type { Socket } from "socket.io";
import config from "../config";
import { User } from "../modules/user/user.model";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

export const socketAuthMiddleware = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Authentication token required"));
    }

    const decoded = jwt.verify(
      token,
      config.jwt_access_secret as string
    ) as any;
    const user = await User.findById(decoded.userId).select(
      "name avatar isActive"
    );

    if (!user || !user.isActive) {
      return next(new Error("User not found or inactive"));
    }

    socket.userId = decoded.userId;
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Invalid authentication token"));
  }
};
