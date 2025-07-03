export const SOCKET_EVENTS = {
  // Connection events
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",

  // User status events
  USER_ONLINE: "user_online",
  USER_OFFLINE: "user_offline",
  USER_TYPING: "user_typing",
  USER_STOP_TYPING: "user_stop_typing",
  UPDATE_LAST_SEEN: "update_last_seen",

  // Message events
  SEND_MESSAGE: "send_message",
  RECEIVE_MESSAGE: "receive_message",
  MESSAGE_DELIVERED: "message_delivered",
  MESSAGE_READ: "message_read",
  TYPING_START: "typing_start",
  TYPING_STOP: "typing_stop",

  // Notification events
  SEND_NOTIFICATION: "send_notification",
  RECEIVE_NOTIFICATION: "receive_notification",
  NOTIFICATION_READ: "notification_read",
  NOTIFICATION_COUNT_UPDATE: "notification_count_update",

  // Post events
  POST_CREATED: "post_created",
  POST_UPDATED: "post_updated",
  POST_DELETED: "post_deleted",
  POST_REACTION: "post_reaction",
  POST_COMMENT: "post_comment",

  // Friend events
  FRIEND_REQUEST_SENT: "friend_request_sent",
  FRIEND_REQUEST_ACCEPTED: "friend_request_accepted",
  FRIEND_REQUEST_REJECTED: "friend_request_rejected",
  FRIEND_ONLINE: "friend_online",
  FRIEND_OFFLINE: "friend_offline",

  // Group events
  GROUP_MESSAGE: "group_message",
  GROUP_MEMBER_JOINED: "group_member_joined",
  GROUP_MEMBER_LEFT: "group_member_left",

  // Error events
  ERROR: "error",
  VALIDATION_ERROR: "validation_error",
} as const
