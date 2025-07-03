import { Types } from "mongoose";

export interface TReaction {
  _id?: string;
  user: Types.ObjectId | string;
  target: Types.ObjectId | string;
  targetType: "post" | "comment";
  type: "like" | "love" | "haha" | "wow" | "sad" | "angry";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TReactionSummary {
  targetId: string;
  targetType: "post" | "comment";
  reactions: {
    like: number;
    love: number;
    haha: number;
    wow: number;
    sad: number;
    angry: number;
  };
  totalReactions: number;
  userReaction?: string;
}
