import type { Types } from "mongoose";

export interface TTradingListing {
  _id?: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  seller: Types.ObjectId;
  location: string;
  views: number;
  likes: string[];
  status: "active" | "sold" | "pending";
  tags: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TTradingContact {
  _id?: string;
  listing: Types.ObjectId | string;
  buyer: Types.ObjectId | string;
  seller: Types.ObjectId | string;
  message: string;
  contactedAt: Date;
  status: "pending" | "responded" | "closed";
}
