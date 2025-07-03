import { Types } from "mongoose";
export interface TGroup {
  _id?: string;
  name: string;
  description?: string;
  avatar?: string;
  coverPhoto?: string;
  type: "group" | "page";
  category: string;
  privacy: "public" | "private" | "secret";
  admin: Types.ObjectId | string;
  moderators: string[];
  members: string[];
  memberRequests: string[];
  bannedMembers: string[];
  posts: string[];
  rules?: string[];
  tags: string[];
  location?: string;
  website?: string;
  email?: string;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  memberCount: number;
  postCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}
