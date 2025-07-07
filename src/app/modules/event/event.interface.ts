import type { Types } from "mongoose"

export interface TEvent {
  _id?: string
  title: string
  description: string
  date: Date
  time: string
  location: string
  category: string
  organizer: Types.ObjectId | string
  attendees: string[]
  maxAttendees?: number
  price: number
  images: string[]
  tags: string[]
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface TEventAttendee {
  _id?: string
  event: Types.ObjectId | string
  user: Types.ObjectId | string
  joinedAt: Date
  status: "confirmed" | "pending" | "cancelled"
}
