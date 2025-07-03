import type { Model } from "mongoose";

export interface TUser {
  toObject(): unknown;
  _id?: string;
  name: string;
  email: string;
  role: "admin" | "user"; // Assuming roles are either admin or user
  password: string;
  avatar?: string;
  coverPhoto?: string;
  bio?: string;
  location?: string;
  website?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  relationshipStatus?: "single" | "in_relationship" | "married" | "complicated";
  work?: string;
  education?: string;
  isActive: boolean;
  isVerified: boolean;
  lastSeen?: Date;
  friends: string[];
  friendRequests: string[];
  sentFriendRequests: string[];
  groups: string[];
  followers: string[];
  following: string[];
  blockedUsers: string[];
  privacy: {
    profileVisibility: "public" | "friends" | "private";
    friendListVisibility: "public" | "friends" | "private";
    postVisibility: "public" | "friends" | "private";
  };
  notifications: {
    email: boolean;
    push: boolean;
    friendRequests: boolean;
    comments: boolean;
    reactions: boolean;
    messages: boolean;
  };
  theme: "light" | "dark" | "auto";
  language: string;
  timezone: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserModel extends Model<TUser> {
  isUserExistsByEmail(email: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
}
