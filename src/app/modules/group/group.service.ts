import httpStatus from "http-status";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { Notification } from "../notification/notification.model";
import { Post } from "../post/post.model";
import { User } from "../user/user.model";
import type { TGroup } from "./group.interface";
import { Group } from "./group.model";

const GroupSearchableFields = ["name", "description", "tags"];

const createGroupIntoDB = async (userId: string, groupData: TGroup) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const group = await Group.create({
    ...groupData,
    admin: userId,
    members: [userId],
    memberCount: 1,
  });

  // Add group to user's groups
  await User.findByIdAndUpdate(userId, {
    $push: { groups: group._id },
  });

  const populatedGroup = await Group.findById(group._id)
    .populate("admin", "name avatar")
    .populate("members", "name avatar");

  return populatedGroup;
};

const getAllGroupsFromDB = async (query: Record<string, unknown>) => {
  const groupQuery = new QueryBuilder(
    Group.find({ isActive: true })
      .populate("admin", "name avatar")
      .select("-members -memberRequests -bannedMembers") as any,
    query
  )
    .search(GroupSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await groupQuery.modelQuery;
  const meta = await groupQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getSingleGroupFromDB = async (userId: string, groupId: string) => {
  const group = await Group.findById(groupId)
    .populate("admin", "name avatar")
    .populate("moderators", "name avatar")
    .populate("members", "name avatar isActive lastSeen");

  if (!group) {
    throw new AppError(httpStatus.NOT_FOUND, "Group not found");
  }

  // Check if user can view this group
  if (group.privacy === "secret" && !group.members.includes(userId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to view this group"
    );
  }

  return group;
};

const updateGroupIntoDB = async (
  userId: string,
  groupId: string,
  payload: Partial<TGroup>
) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError(httpStatus.NOT_FOUND, "Group not found");
  }

  // Check if user is admin or moderator
  if (group.admin.toString() !== userId && !group.moderators.includes(userId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to update this group"
    );
  }

  const updatedGroup = await Group.findByIdAndUpdate(groupId, payload, {
    new: true,
    runValidators: true,
  })
    .populate("admin", "name avatar")
    .populate("moderators", "name avatar");

  return updatedGroup;
};

const deleteGroupFromDB = async (userId: string, groupId: string) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError(httpStatus.NOT_FOUND, "Group not found");
  }

  // Only admin can delete group
  if (group.admin.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only group admin can delete the group"
    );
  }

  // Remove group from all members' groups array
  await User.updateMany({ groups: groupId }, { $pull: { groups: groupId } });

  // Delete all group posts
  await Post.deleteMany({ group: groupId });

  await Group.findByIdAndDelete(groupId);
  return group;
};

const joinGroupIntoDB = async (userId: string, groupId: string) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError(httpStatus.NOT_FOUND, "Group not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Check if already a member
  if (group.members.includes(userId)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are already a member of this group"
    );
  }

  // Check if banned
  if (group.bannedMembers.includes(userId)) {
    throw new AppError(httpStatus.FORBIDDEN, "You are banned from this group");
  }

  if (group.privacy === "private") {
    // For private groups, add to member requests
    if (group.memberRequests.includes(userId)) {
      throw new AppError(httpStatus.BAD_REQUEST, "Join request already sent");
    }

    await Group.findByIdAndUpdate(groupId, {
      $push: { memberRequests: userId },
    });

    // Notify admin
    await Notification.create({
      recipient: group.admin,
      sender: userId,
      type: "group_join",
      title: "New Join Request",
      message: `${user.name} wants to join ${group.name}`,
      data: { groupId },
    });

    return { message: "Join request sent successfully" };
  } else {
    // For public groups, add directly
    await Group.findByIdAndUpdate(groupId, {
      $push: { members: userId },
      $inc: { memberCount: 1 },
    });

    await User.findByIdAndUpdate(userId, {
      $push: { groups: groupId },
    });

    // Notify admin
    await Notification.create({
      recipient: group.admin,
      sender: userId,
      type: "group_join",
      title: "New Member",
      message: `${user.name} joined ${group.name}`,
      data: { groupId },
    });

    return { message: "Joined group successfully" };
  }
};

const leaveGroupIntoDB = async (userId: string, groupId: string) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError(httpStatus.NOT_FOUND, "Group not found");
  }

  // Admin cannot leave their own group
  if (group.admin.toString() === userId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Group admin cannot leave the group. Transfer ownership or delete the group."
    );
  }

  // Check if user is a member
  if (!group.members.includes(userId)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You are not a member of this group"
    );
  }

  await Group.findByIdAndUpdate(groupId, {
    $pull: {
      members: userId,
      moderators: userId,
    },
    $inc: { memberCount: -1 },
  });

  await User.findByIdAndUpdate(userId, {
    $pull: { groups: groupId },
  });

  return { message: "Left group successfully" };
};

const getGroupPostsFromDB = async (
  userId: string,
  groupId: string,
  query: Record<string, unknown>
) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError(httpStatus.NOT_FOUND, "Group not found");
  }

  // Check if user can view group posts
  if (group.privacy === "secret" && !group.members.includes(userId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to view this group's posts"
    );
  }

  if (group.privacy === "private" && !group.members.includes(userId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You must be a member to view this group's posts"
    );
  }

  const postQuery = new QueryBuilder(
    Post.find({ group: groupId })
      .populate("author", "name avatar")
      .populate("sharedPost")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name avatar",
        },
        options: { limit: 3, sort: { createdAt: -1 } },
      }),
    query
  )
    .search(["content", "tags"])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await postQuery.modelQuery;
  const meta = await postQuery.countTotal();

  return {
    meta,
    result,
  };
};

const getUserGroupsFromDB = async (
  userId: string,
  query: Record<string, unknown>
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const groupQuery = new QueryBuilder(
    Group.find({ _id: { $in: user.groups } })
      .populate("admin", "name avatar")
      .select("-members -memberRequests -bannedMembers") as any,
    query
  )
    .search(GroupSearchableFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await groupQuery.modelQuery;
  const meta = await groupQuery.countTotal();

  return {
    meta,
    result,
  };
};

const approveJoinRequestIntoDB = async (
  userId: string,
  groupId: string,
  requestUserId: string
) => {
  const group = await Group.findById(groupId);
  if (!group) {
    throw new AppError(httpStatus.NOT_FOUND, "Group not found");
  }

  // Check if user is admin or moderator
  if (group.admin.toString() !== userId && !group.moderators.includes(userId)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You don't have permission to approve join requests"
    );
  }

  // Check if request exists
  if (!group.memberRequests.includes(requestUserId)) {
    throw new AppError(httpStatus.NOT_FOUND, "Join request not found");
  }

  await Group.findByIdAndUpdate(groupId, {
    $pull: { memberRequests: requestUserId },
    $push: { members: requestUserId },
    $inc: { memberCount: 1 },
  });

  await User.findByIdAndUpdate(requestUserId, {
    $push: { groups: groupId },
  });

  // Notify user
  const requestUser = await User.findById(requestUserId);
  await Notification.create({
    recipient: requestUserId,
    sender: userId,
    type: "group_join",
    title: "Join Request Approved",
    message: `Your request to join ${group.name} has been approved`,
    data: { groupId },
  });

  return { message: "Join request approved successfully" };
};

const getGroupSuggestionsFromDB = async (userId: string, limit = 10) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // Get groups user is not a member of
  const suggestions = await Group.find({
    _id: { $nin: user.groups },
    privacy: { $in: ["public", "private"] },
    isActive: true,
  })
    .populate("admin", "name avatar")
    .select("name avatar description type category memberCount")
    .limit(limit)
    .sort({ memberCount: -1 });

  return suggestions;
};

export const GroupServices = {
  createGroupIntoDB,
  getAllGroupsFromDB,
  getSingleGroupFromDB,
  updateGroupIntoDB,
  deleteGroupFromDB,
  joinGroupIntoDB,
  leaveGroupIntoDB,
  getGroupPostsFromDB,
  getUserGroupsFromDB,
  approveJoinRequestIntoDB,
  getGroupSuggestionsFromDB,
};
