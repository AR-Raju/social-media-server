import { z } from "zod"

const createReactionValidationSchema = z.object({
  body: z.object({
    type: z.enum(["like", "love", "haha", "wow", "sad", "angry"], {
      required_error: "Reaction type is required",
    }),
  }),
})

const getReactionsValidationSchema = z.object({
  query: z.object({
    type: z.enum(["like", "love", "haha", "wow", "sad", "angry"]).optional(),
    limit: z.string().optional(),
    page: z.string().optional(),
  }),
})

export const ReactionValidation = {
  createReactionValidationSchema,
  getReactionsValidationSchema,
}
