import { socketManager } from "./socket.manager"
import { SOCKET_EVENTS } from "./socket.events"
import type { INotificationData, IPostUpdateData, IFriendRequestData } from "./socket.interface"

export class SocketService {
  // Send real-time notification
  static async sendNotification(notificationData: INotificationData) {
    try {
      socketManager.emitToUser(notificationData.recipientId, SOCKET_EVENTS.RECEIVE_NOTIFICATION, notificationData)

      // Update notification count
      const { NotificationServices } = await import("../modules/notification/notification.service")
      const unreadCount = await NotificationServices.getUnreadCountFromDB(notificationData.recipientId)

      socketManager.emitToUser(notificationData.recipientId, SOCKET_EVENTS.NOTIFICATION_COUNT_UPDATE, unreadCount)
    } catch (error) {
      console.error("Error sending real-time notification:", error)
    }
  }

  // Send post update to relevant users
  static async sendPostUpdate(postUpdateData: IPostUpdateData) {
    try {
      const { User } = await import("../modules/user/user.model")
      const { Post } = await import("../modules/post/post.model")

      const post = await Post.findById(postUpdateData.postId).populate("author", "friends")
      if (!post) return

      // Get users who should receive this update (friends, group members, etc.)
      const author = await User.findById(post.author).populate("friends", "_id")
      if (!author) return

      let recipientIds: string[] = []

      if (post.visibility === "public") {
        // For public posts, notify all online users (or implement a more sophisticated algorithm)
        const onlineUsers = socketManager.getOnlineUsers()
        recipientIds = onlineUsers.map((user) => user.userId)
      } else if (post.visibility === "friends") {
        recipientIds = author.friends.map((friend: any) => friend._id.toString())
      }

      // If it's a group post, notify group members
      if (post.group) {
        const { Group } = await import("../modules/group/group.model")
        const group = await Group.findById(post.group)
        if (group) {
          recipientIds = [...recipientIds, ...group.members.map((member: any) => member.toString())]
        }
      }

      // Remove duplicates and author
      recipientIds = [...new Set(recipientIds)].filter((id) => id !== postUpdateData.authorId)

      // Emit to all relevant users
      socketManager.emitToUsers(recipientIds, SOCKET_EVENTS.POST_CREATED, postUpdateData)
    } catch (error) {
      console.error("Error sending post update:", error)
    }
  }

  // Send friend request notification
  static sendFriendRequestUpdate(friendRequestData: IFriendRequestData) {
    try {
      const event =
        friendRequestData.action === "sent"
          ? SOCKET_EVENTS.FRIEND_REQUEST_SENT
          : friendRequestData.action === "accepted"
            ? SOCKET_EVENTS.FRIEND_REQUEST_ACCEPTED
            : SOCKET_EVENTS.FRIEND_REQUEST_REJECTED

      socketManager.emitToUser(friendRequestData.recipientId, event, friendRequestData)
    } catch (error) {
      console.error("Error sending friend request update:", error)
    }
  }

  // Send typing indicator
  static sendTypingIndicator(senderId: string, recipientId: string, isTyping: boolean, conversationId: string) {
    try {
      const event = isTyping ? SOCKET_EVENTS.USER_TYPING : SOCKET_EVENTS.USER_STOP_TYPING

      socketManager.emitToUser(recipientId, event, {
        userId: senderId,
        conversationId,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Error sending typing indicator:", error)
    }
  }

  // Get online status
  static isUserOnline(userId: string): boolean {
    return socketManager.isUserOnline(userId)
  }

  // Get online users count
  static getOnlineUsersCount(): number {
    return socketManager.getOnlineUsers().length
  }

  // Broadcast system message
  static broadcastSystemMessage(message: string, type: "info" | "warning" | "error" = "info") {
    try {
      socketManager.broadcast("system_message", {
        message,
        type,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Error broadcasting system message:", error)
    }
  }

  // Send real-time post reaction
  static sendPostReaction(postId: string, userId: string, reactionType: string, action: "added" | "removed") {
    try {
      // This would notify users viewing the post about the reaction
      socketManager.broadcast(SOCKET_EVENTS.POST_REACTION, {
        postId,
        userId,
        reactionType,
        action,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Error sending post reaction:", error)
    }
  }

  // Send real-time comment
  static sendPostComment(postId: string, commentData: any) {
    try {
      socketManager.broadcast(SOCKET_EVENTS.POST_COMMENT, {
        postId,
        comment: commentData,
        timestamp: new Date(),
      })
    } catch (error) {
      console.error("Error sending post comment:", error)
    }
  }
}
