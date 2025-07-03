import { z } from "zod"

const markAsReadValidationSchema = z.object({
  body: z.object({
    notificationIds: z.array(z.string()).optional(),
    markAll: z.boolean().optional(),
  }),
})

export const NotificationValidation = {
  markAsReadValidationSchema,
}
