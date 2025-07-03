import bcrypt from "bcrypt";
import { Schema, model } from "mongoose";
import type { TUser, UserModel } from "./user.interface";

const userSchema = new Schema<TUser, UserModel>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    avatar: {
      type: String,
      default: "/placeholder.svg?height=150&width=150",
    },
    coverPhoto: {
      type: String,
      default: "/placeholder.svg?height=400&width=800",
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    location: {
      type: String,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    website: {
      type: String,
      maxlength: [200, "Website cannot exceed 200 characters"],
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    relationshipStatus: {
      type: String,
      enum: ["single", "in_relationship", "married", "complicated"],
    },
    work: {
      type: String,
      maxlength: [100, "Work cannot exceed 100 characters"],
    },
    education: {
      type: String,
      maxlength: [100, "Education cannot exceed 100 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    friendRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sentFriendRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    groups: [
      {
        type: Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    privacy: {
      profileVisibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "public",
      },
      friendListVisibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "friends",
      },
      postVisibility: {
        type: String,
        enum: ["public", "friends", "private"],
        default: "friends",
      },
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      friendRequests: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      reactions: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
    },
    theme: {
      type: String,
      enum: ["light", "dark", "auto"],
      default: "light",
    },
    language: {
      type: String,
      default: "en",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ name: "text", bio: "text" });
userSchema.index({ isActive: 1 });
userSchema.index({ lastSeen: -1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const saltRounds = 12;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

// Update lastSeen on login
userSchema.pre("findOneAndUpdate", function (next) {
  this.set({ lastSeen: new Date() });
  next();
});

userSchema.statics.isUserExistsByEmail = async (email: string) =>
  await User.findOne({ email }).select("+password");

userSchema.statics.isPasswordMatched = async (
  plainTextPassword: string,
  hashedPassword: string
) => await bcrypt.compare(plainTextPassword, hashedPassword);

export const User = model<TUser, UserModel>("User", userSchema);
