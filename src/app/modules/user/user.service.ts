import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import type { TUser } from "./user.interface";
import { User } from "./user.model";

const UserSearchableFields = ["name", "bio", "location", "work", "education"];

const createUserIntoDB = async (userData: TUser) => {
  const result = await User.create(userData);
  return result;
};

const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder(User.find(), query)
    .search(UserSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleUserFromDB = async (id: string) => {
  const result = await User.findById(id);
  return result;
};

const updateUserIntoDB = async (id: string, payload: Partial<TUser>) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const deleteUserFromDB = async (id: string) => {
  const result = await User.findByIdAndDelete(id);
  return result;
};

const updateUserProfileIntoDB = async (
  userId: string,
  payload: Partial<TUser>
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "friends", select: "name avatar isActive lastSeen" },
    { path: "groups", select: "name avatar type" },
  ]);

  return updatedUser;
};

const getUserProfileFromDB = async (
  currentUserId: string,
  targetUserId: string
) => {
  const targetUser = await User.findById(targetUserId).populate([
    { path: "friends", select: "name avatar isActive lastSeen" },
    { path: "groups", select: "name avatar type" },
  ]);

  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check privacy settings
  const canViewProfile = await canUserViewProfile(
    currentUserId,
    targetUserId,
    targetUser
  );
  if (!canViewProfile) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to view this profile"
    );
  }

  // Filter sensitive information based on privacy settings
  const filteredUser = filterUserDataByPrivacy(currentUserId, targetUser);

  return filteredUser;
};

const getUserFriendsFromDB = async (
  currentUserId: string,
  targetUserId: string,
  query: Record<string, unknown>
) => {
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check if current user can view target user's friends
  const canViewFriends = await canUserViewFriends(
    currentUserId,
    targetUserId,
    targetUser
  );
  if (!canViewFriends) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to view this user's friends"
    );
  }

  const friendQuery = new QueryBuilder<TUser>(
    User.find({ _id: { $in: targetUser.friends } }).select(
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

const getUserGroupsFromDB = async (
  currentUserId: string,
  targetUserId: string,
  query: Record<string, unknown>
) => {
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Only show public groups or if viewing own profile
  const groupMatch =
    currentUserId === targetUserId ? {} : { privacy: { $in: ["public"] } };

  const aggregationPipeline = [
    { $match: { _id: targetUser._id } },
    {
      $lookup: {
        from: "groups",
        localField: "groups",
        foreignField: "_id",
        as: "userGroups",
        pipeline: [
          { $match: groupMatch },
          {
            $lookup: {
              from: "users",
              localField: "admin",
              foreignField: "_id",
              as: "admin",
              pipeline: [{ $project: { name: 1, avatar: 1 } }],
            },
          },
          { $unwind: "$admin" },
          { $project: { members: 0, memberRequests: 0, bannedMembers: 0 } },
        ],
      },
    },
    { $unwind: "$userGroups" },
    { $replaceRoot: { newRoot: "$userGroups" } },
  ];

  // Apply search, filter, sort, paginate, fields manually if needed
  let groups = await User.aggregate(aggregationPipeline);

  // Convert aggregation result to a Mongoose-like queryable array
  let groupsArray = groups;

  // Search
  if (query.searchTerm) {
    const searchTerm = (query.searchTerm as string).toLowerCase();
    groupsArray = groupsArray.filter((group: any) =>
      group.name?.toLowerCase().includes(searchTerm)
    );
  }

  // Filter
  if (query.type) {
    groupsArray = groupsArray.filter((group: any) => group.type === query.type);
  }

  // Sort
  if (query.sortBy) {
    const sortBy = query.sortBy as string;
    const sortOrder = query.sortOrder === "desc" ? -1 : 1;
    groupsArray = groupsArray.sort((a: any, b: any) => {
      if (a[sortBy] < b[sortBy]) return -1 * sortOrder;
      if (a[sortBy] > b[sortBy]) return 1 * sortOrder;
      return 0;
    });
  }

  // Paginate
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const paginatedGroups = groupsArray.slice(skip, skip + limit);

  // Fields
  if (query.fields) {
    const fields = (query.fields as string).split(",");
    groupsArray = paginatedGroups.map((group: any) => {
      const filtered: any = {};
      fields.forEach((field) => {
        if (group[field] !== undefined) filtered[field] = group[field];
      });
      return filtered;
    });
  } else {
    groupsArray = paginatedGroups;
  }

  const result = groupsArray;
  const meta = { total: groups.length, page, limit, totalPage: 0 };
  meta.totalPage = Math.ceil(meta.total / meta.limit);
  return {
    meta,
    result,
  };
};

const searchUsersFromDB = async (query: Record<string, unknown>) => {
  const userQuery = new QueryBuilder<TUser>(
    User.find({ isActive: true }).select(
      "name avatar bio location work education isActive lastSeen"
    ) as any,
    query
  )
    .search(UserSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return {
    meta,
    result,
  };
};

const blockUserIntoDB = async (userId: string, targetUserId: string) => {
  if (userId === targetUserId) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cannot block yourself");
  }

  const user = await User.findById(userId);
  const targetUser = await User.findById(targetUserId);

  if (!user || !targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.blockedUsers.includes(targetUserId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is already blocked");
  }

  // Add to blocked users
  await User.findByIdAndUpdate(userId, {
    $push: { blockedUsers: targetUserId },
    $pull: { friends: targetUserId },
  });

  // Remove from target user's friends
  await User.findByIdAndUpdate(targetUserId, {
    $pull: { friends: userId },
  });

  return { message: "User blocked successfully" };
};

const unblockUserIntoDB = async (userId: string, targetUserId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (!user.blockedUsers.includes(targetUserId)) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is not blocked");
  }

  await User.findByIdAndUpdate(userId, {
    $pull: { blockedUsers: targetUserId },
  });

  return { message: "User unblocked successfully" };
};

// Helper functions
const canUserViewProfile = async (
  currentUserId: string,
  targetUserId: string,
  targetUser: any
): Promise<boolean> => {
  if (currentUserId === targetUserId) return true;
  if (targetUser.privacy.profileVisibility === "public") return true;
  if (targetUser.privacy.profileVisibility === "friends") {
    return targetUser.friends.includes(currentUserId);
  }
  return false;
};

const canUserViewFriends = async (
  currentUserId: string,
  targetUserId: string,
  targetUser: any
): Promise<boolean> => {
  if (currentUserId === targetUserId) return true;
  if (targetUser.privacy.friendListVisibility === "public") return true;
  if (targetUser.privacy.friendListVisibility === "friends") {
    return targetUser.friends.includes(currentUserId);
  }
  return false;
};

const filterUserDataByPrivacy = (currentUserId: string, targetUser: any) => {
  const userObj = targetUser.toObject();

  if (currentUserId === targetUser._id.toString()) {
    return userObj; // Return full data for own profile
  }

  // Filter based on privacy settings
  if (targetUser.privacy.profileVisibility === "private") {
    return {
      _id: userObj._id,
      name: userObj.name,
      avatar: userObj.avatar,
    };
  }

  if (
    targetUser.privacy.friendListVisibility !== "public" &&
    !targetUser.friends.includes(currentUserId)
  ) {
    delete userObj.friends;
  }

  // Remove sensitive information
  delete userObj.email;
  delete userObj.friendRequests;
  delete userObj.sentFriendRequests;
  delete userObj.blockedUsers;
  delete userObj.notifications;

  return userObj;
};

export const UserServices = {
  createUserIntoDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserIntoDB,
  deleteUserFromDB,
  updateUserProfileIntoDB,
  getUserProfileFromDB,
  getUserFriendsFromDB,
  getUserGroupsFromDB,
  searchUsersFromDB,
  blockUserIntoDB,
  unblockUserIntoDB,
};
