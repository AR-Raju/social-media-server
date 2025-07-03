import { z } from "zod"

const createPostValidationSchema = z.object({
  body: z
    .object({
      content: z.string().max(5000, "Content cannot exceed 5000 characters").optional(),
      images: z.array(z.string().url()).optional(),
      videos: z.array(z.string().url()).optional(),
      files: z.array(z.string().url()).optional(),
      type: z.enum(["text", "image", "video", "file", "shared"]).default("text"),
      visibility: z.enum(["public", "friends", "private"]).default("friends"),
      group: z.string().optional(),
      sharedPost: z.string().optional(),
      tags: z.array(z.string()).optional(),
      location: z.string().optional(),
    })
    .refine(
      (data) => {
        // At least content or media should be provided
        return data.content || data.images?.length || data.videos?.length || data.files?.length || data.sharedPost
      },
      {
        message: "Post must have content, media, or be a shared post",
      },
    ),
})

const updatePostValidationSchema = z.object({
  body: z.object({
    content: z.string().max(5000, "Content cannot exceed 5000 characters").optional(),
    visibility: z.enum(["public", "friends", "private"]).optional(),
    tags: z.array(z.string()).optional(),
    location: z.string().optional(),
  }),
})

const createCommentValidationSchema = z.object({
  body: z.object({
    content: z
      .string({ required_error: "Comment content is required" })
      .max(1000, "Comment cannot exceed 1000 characters"),
    image: z.string().url().optional(),
    parentComment: z.string().optional(),
  }),
})

const reactToPostValidationSchema = z.object({
  body: z.object({
    type: z.enum(["like", "love", "haha", "wow", "sad", "angry"], {
      required_error: "Reaction type is required",
    }),
  }),
})

export const PostValidation = {
  createPostValidationSchema,
  updatePostValidationSchema,
  createCommentValidationSchema,
  reactToPostValidationSchema,
}
