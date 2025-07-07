import { z } from "zod"

const createEventValidationSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "Event title is required" })
      .max(200, "Title cannot exceed 200 characters")
      .trim(),
    description: z
      .string({ required_error: "Event description is required" })
      .max(2000, "Description cannot exceed 2000 characters")
      .trim(),
    date: z.string({ required_error: "Event date is required" }),
    time: z.string({ required_error: "Event time is required" }).trim(),
    location: z
      .string({ required_error: "Event location is required" })
      .max(500, "Location cannot exceed 500 characters")
      .trim(),
    category: z.enum([
      "music",
      "sports",
      "technology",
      "business",
      "education",
      "food",
      "art",
      "health",
      "social",
      "other",
    ]),
    maxAttendees: z.number().min(1, "Max attendees must be at least 1").optional(),
    price: z.number().min(0, "Price cannot be negative").default(0),
    images: z.array(z.string().url()).optional(),
    tags: z.array(z.string()).optional(),
  }),
})

const updateEventValidationSchema = z.object({
  body: z.object({
    title: z.string().max(200, "Title cannot exceed 200 characters").trim().optional(),
    description: z.string().max(2000, "Description cannot exceed 2000 characters").trim().optional(),
    date: z.string().optional(),
    time: z.string().trim().optional(),
    location: z.string().max(500, "Location cannot exceed 500 characters").trim().optional(),
    category: z
      .enum(["music", "sports", "technology", "business", "education", "food", "art", "health", "social", "other"])
      .optional(),
    maxAttendees: z.number().min(1, "Max attendees must be at least 1").optional(),
    price: z.number().min(0, "Price cannot be negative").optional(),
    images: z.array(z.string().url()).optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
})

export const EventValidation = {
  createEventValidationSchema,
  updateEventValidationSchema,
}
