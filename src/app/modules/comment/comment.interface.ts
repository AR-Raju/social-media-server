import { Types } from "mongoose";

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
  mentions: string[];
  hashtags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TCommentReaction {
  _id?: string;
  user: Types.ObjectId | string;
  comment: Types.ObjectId | string;
  type: "like" | "love" | "haha" | "wow" | "sad" | "angry";
  createdAt?: Date;
}
