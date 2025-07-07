import { Schema, model } from "mongoose"
import type { TTradingListing, TTradingContact } from "./trading.interface"

const tradingListingSchema = new Schema<TTradingListing>(
  {
    title: {
      type: String,
      required: [true, "Listing title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Listing description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["electronics", "clothing", "books", "furniture", "vehicles", "sports", "toys", "home", "beauty", "other"],
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: ["new", "like_new", "good", "fair", "poor"],
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [500, "Location cannot exceed 500 characters"],
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["active", "sold", "pending"],
      default: "active",
    },
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

const tradingContactSchema = new Schema<TTradingContact>(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "TradingListing",
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: [true, "Contact message is required"],
      trim: true,
      maxlength: [1000, "Message cannot exceed 1000 characters"],
    },
    contactedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "responded", "closed"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
tradingListingSchema.index({ title: "text", description: "text", tags: "text" })
tradingListingSchema.index({ category: 1 })
tradingListingSchema.index({ condition: 1 })
tradingListingSchema.index({ seller: 1 })
tradingListingSchema.index({ location: 1 })
tradingListingSchema.index({ status: 1 })
tradingListingSchema.index({ isActive: 1 })
tradingListingSchema.index({ price: 1 })

tradingContactSchema.index({ listing: 1, buyer: 1 })
tradingContactSchema.index({ seller: 1 })
tradingContactSchema.index({ status: 1 })

// Virtual for like count
tradingListingSchema.virtual("likeCount").get(function () {
  return this.likes.length
})

// Ensure virtual fields are serialized
tradingListingSchema.set("toJSON", { virtuals: true })

export const TradingListing = model<TTradingListing>("TradingListing", tradingListingSchema)
export const TradingContact = model<TTradingContact>("TradingContact", tradingContactSchema)
