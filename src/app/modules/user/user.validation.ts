import { z } from "zod"

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().max(50, "Name cannot exceed 50 characters").optional(),
    bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
    location: z.string().max(100, "Location cannot exceed 100 characters").optional(),
    website: z.string().max(200, "Website cannot exceed 200 characters").optional(),
    dateOfBirth: z.string().datetime().optional(),
    gender: z.enum(["male", "female", "other"]).optional(),
    relationshipStatus: z.enum(["single", "in_relationship", "married", "complicated"]).optional(),
    work: z.string().max(100, "Work cannot exceed 100 characters").optional(),
    education: z.string().max(100, "Education cannot exceed 100 characters").optional(),
    avatar: z.string().url("Avatar must be a valid URL").optional(),
    coverPhoto: z.string().url("Cover photo must be a valid URL").optional(),
    privacy: z
      .object({
        profileVisibility: z.enum(["public", "friends", "private"]).optional(),
        friendListVisibility: z.enum(["public", "friends", "private"]).optional(),
        postVisibility: z.enum(["public", "friends", "private"]).optional(),
      })
      .optional(),
    notifications: z
      .object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        friendRequests: z.boolean().optional(),
        comments: z.boolean().optional(),
        reactions: z.boolean().optional(),
        messages: z.boolean().optional(),
      })
      .optional(),
    theme: z.enum(["light", "dark", "auto"]).optional(),
    language: z.string().optional(),
    timezone: z.string().optional(),
  }),
})

export const UserValidation = {
  updateUserValidationSchema,
}
