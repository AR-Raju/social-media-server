import { Types } from "mongoose";

export interface TNotification {
  _id?: string;
  recipient: Types.ObjectId | string;
  sender: Types.ObjectId | string;
  type:
    | "friend_request"
    | "friend_accept"
    | "post_reaction"
    | "post_comment"
    | "post_share"
    | "group_invite"
    | "group_join"
    | "message";
  title: string;
  message: string;
  data?: {
    postId?: string;
    commentId?: string;
    groupId?: string;
    messageId?: string;
  };
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
