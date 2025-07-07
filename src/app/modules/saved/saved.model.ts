import { Schema, model } from "mongoose"
import type { TSavedItem } from "./saved.interface"

const savedItemSchema = new Schema<TSavedItem>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemType: {
      type: String,
      required: true,
      enum: ["post", "event", "listing"],
    },
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "itemType",
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Indexes
savedItemSchema.index({ user: 1, itemType: 1 })
savedItemSchema.index({ user: 1, itemId: 1, itemType: 1 }, { unique: true })
savedItemSchema.index({ savedAt: -1 })

// Virtual to get the correct model name for population
savedItemSchema.virtual("itemModel").get(function () {
  switch (this.itemType) {
    case "post":
      return "Post"
    case "event":
      return "Event"
    case "listing":
      return "TradingListing"
    default:
      return null
  }
})

export const SavedItem = model<TSavedItem>("SavedItem", savedItemSchema)
