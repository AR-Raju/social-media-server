import type { Server } from "socket.io";
import { User } from "../modules/user/user.model";
import { SOCKET_EVENTS } from "./socket.events";
import type {
  IAuthenticatedSocket,
  IOnlineUser,
  ITypingUser,
} from "./socket.interface";

class SocketManager {
  private io: Server | null = null;
  private onlineUsers: Map<string, IOnlineUser> = new Map();
  private typingUsers: Map<string, ITypingUser> = new Map();
  private userSockets: Map<string, string[]> = new Map(); // userId -> socketIds[]

  setIO(io: Server) {
    this.io = io;
  }

  getIO(): Server | null {
    return this.io;
  }

  // User connection management
  addUser(socket: IAuthenticatedSocket) {
    if (!socket.userId) return;

    const userId = socket.userId;
    const socketId = socket.id;

    // Add to user sockets mapping
    const existingSockets = this.userSockets.get(userId) || [];
    this.userSockets.set(userId, [...existingSockets, socketId]);

    // Add to online users
    this.onlineUsers.set(userId, {
      userId,
      socketId,
      name: socket.user.name,
      avatar: socket.user?.avatar,
      lastSeen: new Date(),
    });

    // Update user's last seen in database
    User.findByIdAndUpdate(userId, { lastSeen: new Date() }).exec();

    // Join user to their personal room
    socket.join(`user_${userId}`);

    // Notify friends that user is online
    this.notifyFriendsUserOnline(userId);

    console.log(`User ${socket.user.name} connected with socket ${socketId}`);
  }

  removeUser(socket: IAuthenticatedSocket) {
    if (!socket.userId) return;

    const userId = socket.userId;
    const socketId = socket.id;

    // Remove from user sockets mapping
    const existingSockets = this.userSockets.get(userId) || [];
    const updatedSockets = existingSockets.filter((id) => id !== socketId);

    if (updatedSockets.length === 0) {
      // User is completely offline
      this.userSockets.delete(userId);
      this.onlineUsers.delete(userId);

      // Update user's last seen in database
      User.findByIdAndUpdate(userId, { lastSeen: new Date() }).exec();

      // Notify friends that user is offline
      this.notifyFriendsUserOffline(userId);
    } else {
      this.userSockets.set(userId, updatedSockets);
    }

    // Remove from typing users
    this.typingUsers.delete(socketId);

    console.log(
      `User ${socket.user?.name} disconnected from socket ${socketId}`
    );
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  // Get online users
  getOnlineUsers(): IOnlineUser[] {
    return Array.from(this.onlineUsers.values());
  }

  // Get user's socket IDs
  getUserSockets(userId: string): string[] {
    return this.userSockets.get(userId) || [];
  }

  // Emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    if (!this.io) return;

    const socketIds = this.getUserSockets(userId);
    socketIds.forEach((socketId) => {
      this.io?.to(socketId).emit(event, data);
    });
  }

  // Emit to user's room
  emitToUserRoom(userId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`user_${userId}`).emit(event, data);
  }

  // Emit to multiple users
  emitToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => {
      this.emitToUser(userId, event, data);
    });
  }

  // Friend status notifications
  private async notifyFriendsUserOnline(userId: string) {
    try {
      const user = await User.findById(userId).populate("friends", "_id");
      if (!user) return;

      const friendIds = user.friends.map((friend: any) =>
        friend._id.toString()
      );
      const onlineUserData = this.onlineUsers.get(userId);

      this.emitToUsers(friendIds, SOCKET_EVENTS.FRIEND_ONLINE, {
        userId,
        name: onlineUserData?.name,
        avatar: onlineUserData?.avatar,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error notifying friends user online:", error);
    }
  }

  private async notifyFriendsUserOffline(userId: string) {
    try {
      const user = await User.findById(userId).populate("friends", "_id");
      if (!user) return;

      const friendIds = user.friends.map((friend: any) =>
        friend._id.toString()
      );

      this.emitToUsers(friendIds, SOCKET_EVENTS.FRIEND_OFFLINE, {
        userId,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error notifying friends user offline:", error);
    }
  }

  // Typing indicators
  setUserTyping(
    socketId: string,
    userId: string,
    name: string,
    conversationId: string
  ) {
    this.typingUsers.set(socketId, { userId, name, conversationId });
  }

  removeUserTyping(socketId: string) {
    this.typingUsers.delete(socketId);
  }

  getTypingUsers(conversationId: string): ITypingUser[] {
    return Array.from(this.typingUsers.values()).filter(
      (user) => user.conversationId === conversationId
    );
  }

  // Broadcast to all connected users
  broadcast(event: string, data: any) {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  // Get online friends of a user
  async getOnlineFriends(userId: string): Promise<IOnlineUser[]> {
    try {
      const user = await User.findById(userId).populate("friends", "_id");
      if (!user) return [];

      const friendIds = user.friends.map((friend: any) =>
        friend._id.toString()
      );
      return Array.from(this.onlineUsers.values()).filter((onlineUser) =>
        friendIds.includes(onlineUser.userId)
      );
    } catch (error) {
      console.error("Error getting online friends:", error);
      return [];
    }
  }
}

export const socketManager = new SocketManager();
