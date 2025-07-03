import { Types } from "mongoose";

export interface TFriendRequest {
  _id?: string;
  sender: Types.ObjectId | string;
  recipient: Types.ObjectId | string;
  status: "pending" | "accepted" | "rejected";
  message?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
