import { z } from "zod"

const saveItemValidationSchema = z.object({
  params: z.object({
    itemType: z.enum(["posts", "events", "listings"]),
    itemId: z.string({ required_error: "Item ID is required" }),
  }),
})

export const SavedValidation = {
  saveItemValidationSchema,
}
