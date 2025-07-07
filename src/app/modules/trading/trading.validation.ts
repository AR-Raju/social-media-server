import { z } from "zod"

const createListingValidationSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "Listing title is required" })
      .max(200, "Title cannot exceed 200 characters")
      .trim(),
    description: z
      .string({ required_error: "Listing description is required" })
      .max(2000, "Description cannot exceed 2000 characters")
      .trim(),
    price: z.number({ required_error: "Price is required" }).min(0, "Price cannot be negative"),
    category: z.enum([
      "electronics",
      "clothing",
      "books",
      "furniture",
      "vehicles",
      "sports",
      "toys",
      "home",
      "beauty",
      "other",
    ]),
    condition: z.enum(["new", "like_new", "good", "fair", "poor"]),
    images: z.array(z.string().url()).optional(),
    location: z
      .string({ required_error: "Location is required" })
      .max(500, "Location cannot exceed 500 characters")
      .trim(),
    tags: z.array(z.string()).optional(),
  }),
})

const updateListingValidationSchema = z.object({
  body: z.object({
    title: z.string().max(200, "Title cannot exceed 200 characters").trim().optional(),
    description: z.string().max(2000, "Description cannot exceed 2000 characters").trim().optional(),
    price: z.number().min(0, "Price cannot be negative").optional(),
    category: z
      .enum(["electronics", "clothing", "books", "furniture", "vehicles", "sports", "toys", "home", "beauty", "other"])
      .optional(),
    condition: z.enum(["new", "like_new", "good", "fair", "poor"]).optional(),
    images: z.array(z.string().url()).optional(),
    location: z.string().max(500, "Location cannot exceed 500 characters").trim().optional(),
    status: z.enum(["active", "sold", "pending"]).optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
})

const contactSellerValidationSchema = z.object({
  body: z.object({
    message: z
      .string({ required_error: "Contact message is required" })
      .max(1000, "Message cannot exceed 1000 characters")
      .trim(),
  }),
})

export const TradingValidation = {
  createListingValidationSchema,
  updateListingValidationSchema,
  contactSellerValidationSchema,
}
