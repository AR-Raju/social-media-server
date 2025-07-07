import type { Types } from "mongoose"

export interface TSavedItem {
  _id?: string
  user: Types.ObjectId | string
  itemType: "post" | "event" | "listing"
  itemId: Types.ObjectId | string
  savedAt: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface TSavedPost {
  _id: string
  author: {
    _id: string
    name: string
    avatar?: string
  }
  content?: string
  images?: string[]
  type: string
  createdAt: string
  savedAt: string
}

export interface TSavedEvent {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  organizer: {
    _id: string
    name: string
    avatar?: string
  }
  price: number
  images: string[]
  createdAt: string
  savedAt: string
}

export interface TSavedListing {
  _id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  images: string[]
  seller: {
    _id: string
    name: string
    avatar?: string
  }
  location: string
  status: string
  createdAt: string
  savedAt: string
}
