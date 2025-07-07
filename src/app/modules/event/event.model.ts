import { Schema, model } from "mongoose"
import type { TEvent, TEventAttendee } from "./event.interface"

const eventSchema = new Schema<TEvent>(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Event description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    date: {
      type: Date,
      required: [true, "Event date is required"],
    },
    time: {
      type: String,
      required: [true, "Event time is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Event location is required"],
      trim: true,
      maxlength: [500, "Location cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Event category is required"],
      enum: ["music", "sports", "technology", "business", "education", "food", "art", "health", "social", "other"],
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxAttendees: {
      type: Number,
      min: [1, "Max attendees must be at least 1"],
    },
    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

const eventAttendeeSchema = new Schema<TEventAttendee>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled"],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
eventSchema.index({ title: "text", description: "text", tags: "text" })
eventSchema.index({ category: 1 })
eventSchema.index({ date: 1 })
eventSchema.index({ organizer: 1 })
eventSchema.index({ location: 1 })
eventSchema.index({ isActive: 1 })

eventAttendeeSchema.index({ event: 1, user: 1 }, { unique: true })
eventAttendeeSchema.index({ user: 1 })

// Virtual for attendee count
eventSchema.virtual("attendeeCount").get(function () {
  return this.attendees.length
})

// Ensure virtual fields are serialized
eventSchema.set("toJSON", { virtuals: true })

export const Event = model<TEvent>("Event", eventSchema)
export const EventAttendee = model<TEventAttendee>("EventAttendee", eventAttendeeSchema)
