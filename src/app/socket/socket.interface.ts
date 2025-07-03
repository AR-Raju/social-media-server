import { Socket } from "socket.io";

export interface ISocketUser {
  userId: string;
  socketId: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface ITypingUser {
  userId: string;
  name: string;
  conversationId: string;
}

export interface IOnlineUser {
  userId: string;
  socketId: string;
  name: string;
  avatar?: string;
  lastSeen: Date;
}

export interface IMessageData {
  messageId: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: "text" | "image" | "file";
  timestamp: Date;
  conversationId: string;
}

export interface INotificationData {
  notificationId: string;
  recipientId: string;
  senderId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

export interface IPostUpdateData {
  postId: string;
  authorId: string;
  action: "create" | "update" | "delete" | "react" | "comment";
  data?: any;
  timestamp: Date;
}

export interface IFriendRequestData {
  requestId: string;
  senderId: string;
  recipientId: string;
  action: "sent" | "accepted" | "rejected";
  timestamp: Date;
}

export interface IAuthenticatedSocket extends Socket {
  id: string;
  userId?: string;
}
