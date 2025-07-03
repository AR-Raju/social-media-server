import { z } from "zod"

const sendFriendRequestValidationSchema = z.object({
  body: z.object({
    message: z.string().max(200, "Message cannot exceed 200 characters").optional(),
  }),
})

export const FriendValidation = {
  sendFriendRequestValidationSchema,
}
