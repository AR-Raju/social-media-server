import { Schema, model, models } from "mongoose";
import type { TReaction } from "./reaction.interface";

const reactionSchema = new Schema<TReaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    target: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "targetType",
    },
    targetType: {
      type: String,
      required: true,
      enum: ["post", "comment"],
    },
    type: {
      type: String,
      required: true,
      enum: ["like", "love", "haha", "wow", "sad", "angry"],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
reactionSchema.index({ target: 1, targetType: 1 });
reactionSchema.index({ user: 1, target: 1, targetType: 1 }, { unique: true });
reactionSchema.index({ user: 1 });
reactionSchema.index({ type: 1 });

export const Reaction =
  models.Comment || model<TReaction>("Reaction", reactionSchema);
