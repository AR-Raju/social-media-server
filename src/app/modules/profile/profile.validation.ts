import { z } from "zod";

const updateProfileValidationSchema = z.object({
  body: z.object({
    profilePicture: z
      .string()
      .url("Profile picture must be a valid URL")
      .optional(),
    name: z.string().max(100, "Name cannot exceed 100 characters").optional(),
    designation: z
      .string()
      .max(100, "Designation cannot exceed 100 characters")
      .optional(),
    introduction: z
      .string()
      .max(2000, "Introduction cannot exceed 2000 characters")
      .optional(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
      .optional(),
    email: z.string().email("Please enter a valid email").optional(),
    address: z
      .string()
      .max(500, "Address cannot exceed 500 characters")
      .optional(),
    socialLinks: z
      .object({
        linkedin: z.string().url("LinkedIn URL must be a valid URL").optional(),
        github: z.string().url("GitHub URL must be a valid URL").optional(),
        twitter: z.string().url("Twitter URL must be a valid URL").optional(),
      })
      .optional(),
    resumeUrl: z.string().url("Resume URL must be a valid URL").optional(),
  }),
});

export const ProfileValidation = {
  updateProfileValidationSchema,
};
