import { Types } from "mongoose";

export interface TMessage {
  _id?: string;
  sender: Types.ObjectId | string;
  recipient: Types.ObjectId | string;
  content: string;
  image?: string;
  file?: string;
  type: "text" | "image" | "file";
  isRead: boolean;
  readAt?: Date;
  isEdited: boolean;
  editedAt?: Date;
  replyTo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TConversation {
  _id?: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
