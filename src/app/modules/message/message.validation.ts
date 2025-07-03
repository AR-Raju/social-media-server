import { z } from "zod"

const sendMessageValidationSchema = z.object({
  body: z.object({
    content: z
      .string({ required_error: "Message content is required" })
      .max(1000, "Message cannot exceed 1000 characters"),
    image: z.string().url().optional(),
    file: z.string().url().optional(),
    type: z.enum(["text", "image", "file"]).default("text"),
    replyTo: z.string().optional(),
  }),
})

export const MessageValidation = {
  sendMessageValidationSchema,
}
