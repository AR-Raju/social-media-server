import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { Notification } from "../notification/notification.model";
import { User } from "../user/user.model";
import { FriendRequest } from "./friend.model";

const sendFriendRequestIntoDB = async (
  senderId: string,
  targetUserId: string,
  message?: string
) => {
  // Check if target user exists
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check if trying to send request to self
  if (senderId === targetUserId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Cannot send friend request to yourself"
    );
  }

  // Check if already friends
  const sender = await User.findById(senderId);
  if (sender?.friends.includes(targetUserId)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are already friends with this user"
    );
  }

  // Check if request already exists
  const existingRequest = await FriendRequest.findOne({
    $or: [
      { sender: senderId, recipient: targetUserId },
      { sender: targetUserId, recipient: senderId },
    ],
  });

  if (existingRequest) {
    if (existingRequest.status === "pending") {
      throw new AppError(httpStatus.BAD_REQUEST, "Friend request already sent");
    }
    if (existingRequest.status === "accepted") {
      throw new AppError(httpStatus.BAD_REQUEST, "You are already friends");
    }
  }

  // Create friend request
  const friendRequest = await FriendRequest.create({
    sender: senderId,
    recipient: targetUserId,
    message,
  });

  // Add to user's sent requests and target's received requests
  await User.findByIdAndUpdate(senderId, {
    $push: { sentFriendRequests: friendRequest._id },
  });

  await User.findByIdAndUpdate(targetUserId, {
    $push: { friendRequests: friendRequest._id },
  });

  // Create notification
  await Notification.create({
    recipient: targetUserId,
    sender: senderId,
    type: "friend_request",
    title: "New Friend Request",
    message: `${sender?.name} sent you a friend request`,
  });

  const populatedRequest = await FriendRequest.findById(friendRequest._id)
    .populate("sender", "name avatar")
    .populate("recipient", "name avatar");

  return populatedRequest;
};

const acceptFriendRequestIntoDB = async (userId: string, requestId: string) => {
  const friendRequest = await FriendRequest.findById(requestId);
  if (!friendRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Friend request not found");
  }

  // Check if user is the recipient
  if (friendRequest.recipient.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only accept requests sent to you"
    );
  }

  if (friendRequest.status !== "pending") {
    throw new AppError(httpStatus.BAD_REQUEST, "Friend request is not pending");
  }

  // Update request status
  await FriendRequest.findByIdAndUpdate(requestId, { status: "accepted" });

  // Add each other as friends
  await User.findByIdAndUpdate(friendRequest.sender, {
    $push: { friends: friendRequest.recipient },
    $pull: { sentFriendRequests: requestId },
  });

  await User.findByIdAndUpdate(friendRequest.recipient, {
    $push: { friends: friendRequest.sender },
    $pull: { friendRequests: requestId },
  });

  // Create notification for sender
  const recipient = await User.findById(userId);
  await Notification.create({
    recipient: friendRequest.sender,
    sender: userId,
    type: "friend_accept",
    title: "Friend Request Accepted",
    message: `${recipient?.name} accepted your friend request`,
  });

  return friendRequest;
};

const rejectFriendRequestIntoDB = async (userId: string, requestId: string) => {
  const friendRequest = await FriendRequest.findById(requestId);
  if (!friendRequest) {
    throw new AppError(httpStatus.NOT_FOUND, "Friend request not found");
  }

  // Check if user is the recipient
  if (friendRequest.recipient.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only reject requests sent to you"
    );
  }

  if (friendRequest.status !== "pending") {
    throw new AppError(httpStatus.BAD_REQUEST, "Friend request is not pending");
  }

  // Update request status
  await FriendRequest.findByIdAndUpdate(requestId, { status: "rejected" });

  // Remove from user arrays
  await User.findByIdAndUpdate(friendRequest.sender, {
    $pull: { sentFriendRequests: requestId },
  });

  await User.findByIdAndUpdate(friendRequest.recipient, {
    $pull: { friendRequests: requestId },
  });

  return friendRequest;
};

const removeFriendFromDB = async (userId: string, friendUserId: string) => {
  const user = await User.findById(userId);
  const friend = await User.findById(friendUserId);

  if (!user || !friend) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check if they are friends
  if (!user.friends.includes(friendUserId)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not friends with this user"
    );
  }

  // Remove from each other's friend lists
  await User.findByIdAndUpdate(userId, {
    $pull: { friends: friendUserId },
  });

  await User.findByIdAndUpdate(friendUserId, {
    $pull: { friends: userId },
  });

  return { message: "Friend removed successfully" };
};

const getFriendsListFromDB = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const friendQuery = new QueryBuilder(
    User.find({ _id: { $in: user.friends } }).select(
      "name avatar bio location isActive lastSeen"
    ) as any,
    query
  )
    .search(["name", "bio"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await friendQuery.modelQuery;
  const meta = await friendQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getFriendRequestsFromDB = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const requestQuery = new QueryBuilder(
    FriendRequest.find({ recipient: userId, status: "pending" })
      .populate("sender", "name avatar bio location")
      .sort({ createdAt: -1 }),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await requestQuery.modelQuery;
  const meta = await requestQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSentFriendRequestsFromDB = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const requestQuery = new QueryBuilder(
    FriendRequest.find({ sender: userId, status: "pending" })
      .populate("recipient", "name avatar bio location")
      .sort({ createdAt: -1 }),
    query
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await requestQuery.modelQuery;
  const meta = await requestQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getFriendSuggestionsFromDB = async (userId: string, limit = 10) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Get users who are not friends and haven't been sent requests
  const excludeIds = [
    userId,
    ...user.friends,
    ...user.sentFriendRequests,
    ...user.friendRequests,
  ];

  const suggestions = await User.find({
    _id: { $nin: excludeIds },
    isActive: true,
  })
    .select("name avatar bio location")
    .limit(limit);

  return suggestions;
};

export const FriendServices = {
  sendFriendRequestIntoDB,
  acceptFriendRequestIntoDB,
  rejectFriendRequestIntoDB,
  removeFriendFromDB,
  getFriendsListFromDB,
  getFriendRequestsFromDB,
  getSentFriendRequestsFromDB,
  getFriendSuggestionsFromDB,
};
