import type { Server } from "socket.io";
import { MessageServices } from "../modules/message/message.service";
import { NotificationServices } from "../modules/notification/notification.service";
import { User } from "../modules/user/user.model";
import { SOCKET_EVENTS } from "./socket.events";
import { IAuthenticatedSocket } from "./socket.interface";
import { socketManager } from "./socket.manager";

export const setupSocketHandlers = (io: Server) => {
  io.on(SOCKET_EVENTS.CONNECTION, (socket: IAuthenticatedSocket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Add user to online users
    socketManager.addUser(socket);

    // Handle joining rooms
    socket.on(SOCKET_EVENTS.JOIN_ROOM, (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    // Handle leaving rooms
    socket.on(SOCKET_EVENTS.LEAVE_ROOM, (roomId: string) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // Handle sending messages
    socket.on(SOCKET_EVENTS.SEND_MESSAGE, async (data) => {
      try {
        if (!socket.userId) return;

        const {
          recipientId,
          content,
          type = "text",
          image,
          file,
          replyTo,
        } = data;

        // Create message in database
        const message = await MessageServices.sendMessageIntoDB(
          socket.userId,
          recipientId,
          {
            content,
            type,
            image,
            file,
            replyTo,
          }
        );

        // Emit to recipient if message is not null
        if (message) {
          socketManager.emitToUser(recipientId, SOCKET_EVENTS.RECEIVE_MESSAGE, {
            messageId: message._id,
            senderId: socket.userId,
            recipientId,
            content: message.content,
            type: message.type,
            image: message.image,
            file: message.file,
            replyTo: message.replyTo,
            sender: message.sender,
            timestamp: message.createdAt,
            conversationId: `${socket.userId}_${recipientId}`,
          });

          // Emit back to sender for confirmation
          socket.emit(SOCKET_EVENTS.MESSAGE_DELIVERED, {
            messageId: message._id,
            timestamp: message.createdAt,
          });
        } else {
          socket.emit(SOCKET_EVENTS.ERROR, {
            message: "Failed to send message: message is null",
          });
        }
      } catch (error) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: "Failed to send message",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Handle typing indicators
    socket.on(SOCKET_EVENTS.TYPING_START, (data) => {
      const { recipientId, conversationId } = data;
      if (!socket.userId) return;

      socketManager.setUserTyping(
        socket.id,
        socket.userId,
        socket.use.name,
        conversationId
      );

      socketManager.emitToUser(recipientId, SOCKET_EVENTS.USER_TYPING, {
        userId: socket.userId,
        name: socket.use.name,
        conversationId,
      });
    });

    socket.on(SOCKET_EVENTS.TYPING_STOP, (data) => {
      const { recipientId, conversationId } = data;
      if (!socket.userId) return;

      socketManager.removeUserTyping(socket.id);

      socketManager.emitToUser(recipientId, SOCKET_EVENTS.USER_STOP_TYPING, {
        userId: socket.userId,
        conversationId,
      });
    });

    // Handle message read receipts
    socket.on(SOCKET_EVENTS.MESSAGE_READ, async (data) => {
      try {
        const { messageId, senderId } = data;
        if (!socket.userId) return;

        // Update message as read in database
        // This would be implemented in MessageServices

        // Notify sender that message was read
        socketManager.emitToUser(senderId, SOCKET_EVENTS.MESSAGE_READ, {
          messageId,
          readBy: socket.userId,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error marking message as read:", error);
      }
    });

    // Handle notification read
    socket.on(SOCKET_EVENTS.NOTIFICATION_READ, async (data) => {
      try {
        const { notificationIds, markAll } = data;
        if (!socket.userId) return;

        await NotificationServices.markNotificationsAsReadIntoDB(
          socket.userId,
          notificationIds,
          markAll
        );

        // Get updated unread count
        const unreadCount = await NotificationServices.getUnreadCountFromDB(
          socket.userId
        );

        socket.emit(SOCKET_EVENTS.NOTIFICATION_COUNT_UPDATE, unreadCount);
      } catch (error) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: "Failed to mark notifications as read",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Handle getting online friends
    socket.on("get_online_friends", async () => {
      try {
        if (!socket.userId) return;

        const onlineFriends = await socketManager.getOnlineFriends(
          socket.userId
        );
        socket.emit("online_friends", onlineFriends);
      } catch (error) {
        socket.emit(SOCKET_EVENTS.ERROR, {
          message: "Failed to get online friends",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });

    // Handle getting online users count
    socket.on("get_online_count", () => {
      const onlineUsers = socketManager.getOnlineUsers();
      socket.emit("online_count", { count: onlineUsers.length });
    });

    // Handle user status update
    socket.on(SOCKET_EVENTS.UPDATE_LAST_SEEN, async () => {
      try {
        if (!socket.userId) return;

        await User.findByIdAndUpdate(socket.userId, { lastSeen: new Date() });
      } catch (error) {
        console.error("Error updating last seen:", error);
      }
    });

    // Handle disconnect
    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log(`Socket disconnected: ${socket.id}, reason: ${reason}`);
      socketManager.removeUser(socket);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });
};
