import { z } from "zod";

const createGroupValidationSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Group name is required" })
      .max(100, "Group name cannot exceed 100 characters"),
    description: z
      .string()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional(),
    avatar: z.union([z.string().url(), z.literal("")]).optional(),
    coverPhoto: z.string().url().optional(),
    type: z.enum(["group", "page"], { required_error: "Type is required" }),
    category: z.string({ required_error: "Category is required" }),
    privacy: z.enum(["public", "private", "secret"]).default("public"),
    rules: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    location: z.string().optional(),
    website: z.string().url().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
});

const updateGroupValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .max(100, "Group name cannot exceed 100 characters")
      .optional(),
    description: z
      .string()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional(),
    avatar: z.string().url().optional(),
    coverPhoto: z.string().url().optional(),
    category: z.string().optional(),
    privacy: z.enum(["public", "private", "secret"]).optional(),
    rules: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    location: z.string().optional(),
    website: z.string().url().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
});

export const GroupValidation = {
  createGroupValidationSchema,
  updateGroupValidationSchema,
};
