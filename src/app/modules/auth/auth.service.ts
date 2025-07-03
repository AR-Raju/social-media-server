import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import config from "../../config";
import AppError from "../../errors/AppError";
import { User } from "../user/user.model";
import type { TLoginUser, TOAuthUser, TRegisterUser } from "./auth.interface";

const registerUser = async (payload: TRegisterUser) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email: payload.email });
  if (existingUser) {
    throw new AppError(
      httpStatus.CONFLICT,
      "User already exists with this email"
    );
  }

  // Remove confirmPassword from payload
  const { confirmPassword, ...userData } = payload;

  const user = await User.create(userData);

  // Remove password from response
  const userResponse = user.toObject() as Record<string, any>;
  if ("password" in userResponse) {
    delete userResponse.password;
  }

  return userResponse;
};

const loginUser = async (payload: TLoginUser) => {
  const user = await User.isUserExistsByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (!user.isActive) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is deactivated!");
  }

  if (!(await User.isPasswordMatched(payload?.password, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, "Password does not match");
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role, // Include user role for authorization
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: "7d",
  });

  const refreshToken = jwt.sign(
    jwtPayload,
    config.jwt_refresh_secret as string,
    {
      expiresIn: "30d",
    }
  );

  // Update last seen
  await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });

  // Remove password from user object
  const userResponse = user.toObject() as Record<string, any>;
  if ("password" in userResponse) {
    delete userResponse.password;
  }

  return {
    accessToken,
    refreshToken,
    user: userResponse,
  };
};

const oauthLogin = async (payload: TOAuthUser) => {
  let user = await User.findOne({ email: payload.email });

  if (!user) {
    // Create new user for OAuth
    user = await User.create({
      name: payload.name,
      email: payload.email,
      avatar: payload.avatar,
      password: Math.random().toString(36).slice(-8), // Random password for OAuth users
      isVerified: true,
    });
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    name: user.name,
    role: user.role, // Include user role for authorization
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: "7d",
  });

  const refreshToken = jwt.sign(
    jwtPayload,
    config.jwt_refresh_secret as string,
    {
      expiresIn: "30d",
    }
  );

  // Update last seen
  await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
    },
  };
};

const getMe = async (userId: string) => {
  const result = await User.findById(userId).populate([
    { path: "friends", select: "name avatar isActive lastSeen" },
    { path: "groups", select: "name avatar type" },
  ]);
  return result;
};

const changePassword = async (
  userData: any,
  payload: { oldPassword: string; newPassword: string }
) => {
  const user = await User.isUserExistsByEmail(userData.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  if (!user.isActive) {
    throw new AppError(httpStatus.FORBIDDEN, "User account is deactivated!");
  }

  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password))) {
    throw new AppError(httpStatus.FORBIDDEN, "Old password does not match");
  }

  await User.findByIdAndUpdate(
    user._id,
    {
      password: payload.newPassword,
    },
    {
      new: true,
    }
  );

  return null;
};

const refreshToken = async (token: string) => {
  const decoded = jwt.verify(token, config.jwt_refresh_secret as string) as any;

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found!");
  }

  const jwtPayload = {
    userId: user._id,
    email: user.email,
    name: user.name,
  };

  const accessToken = jwt.sign(jwtPayload, config.jwt_access_secret as string, {
    expiresIn: "7d",
  });

  return { accessToken };
};

export const AuthServices = {
  registerUser,
  loginUser,
  oauthLogin,
  getMe,
  changePassword,
  refreshToken,
};
