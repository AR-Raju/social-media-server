import { z } from "zod"

const createCommentValidationSchema = z.object({
  body: z.object({
    content: z
      .string({ required_error: "Comment content is required" })
      .min(1, "Comment content cannot be empty")
      .max(2000, "Comment cannot exceed 2000 characters"),
    image: z.string().url("Image must be a valid URL").optional(),
    parentComment: z.string().optional(),
  }),
})

const updateCommentValidationSchema = z.object({
  body: z.object({
    content: z
      .string()
      .min(1, "Comment content cannot be empty")
      .max(2000, "Comment cannot exceed 2000 characters")
      .optional(),
    image: z.string().url("Image must be a valid URL").optional(),
  }),
})

const reactToCommentValidationSchema = z.object({
  body: z.object({
    type: z.enum(["like", "love", "haha", "wow", "sad", "angry"], {
      required_error: "Reaction type is required",
    }),
  }),
})

export const CommentValidation = {
  createCommentValidationSchema,
  updateCommentValidationSchema,
  reactToCommentValidationSchema,
}
