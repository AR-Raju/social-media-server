import { Types } from "mongoose";

export interface TPost {
  _id?: string;
  author: Types.ObjectId | string;
  content?: string;
  images?: string[];
  videos?: string[];
  files?: string[];
  type: "text" | "image" | "video" | "file" | "shared";
  visibility: "public" | "friends" | "private";
  group?: string;
  sharedPost?: string;
  reactions: {
    like: string[];
    love: string[];
    haha: string[];
    wow: string[];
    sad: string[];
    angry: string[];
  };
  comments: string[];
  shares: string[];
  views: number;
  isEdited: boolean;
  editedAt?: Date;
  tags: string[];
  location?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TComment {
  _id?: string;
  post: Types.ObjectId | string;
  author: Types.ObjectId | string;
  content: string;
  image?: string;
  parentComment?: string;
  replies: string[];
  reactions: {
    like: string[];
    love: string[];
    haha: string[];
    wow: string[];
    sad: string[];
    angry: string[];
  };
  isEdited: boolean;
  editedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TReaction {
  _id?: string;
  user: Types.ObjectId | string;
  target: Types.ObjectId | string;
  targetType: "post" | "comment";
  type: "like" | "love" | "haha" | "wow" | "sad" | "angry";
  createdAt?: Date;
}
