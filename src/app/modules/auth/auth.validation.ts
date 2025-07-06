import { z } from "zod";

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: "Email is required." }).email(),
    password: z.string({ required_error: "Password is required" }),
  }),
});

const registerValidationSchema = z.object({
  body: z
    .object({
      name: z
        .string({ required_error: "Name is required." })
        .min(2, "Name must be at least 2 characters"),
      email: z.string({ required_error: "Email is required." }).email(),
      role: z.enum(["admin", "user"], {
        required_error: "Role is required",
        invalid_type_error: "Role must be either 'admin' or 'user'",
      }),
      password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters"),
      confirmPassword: z.string({
        required_error: "Confirm password is required",
      }),
      avatar: z.union([z.string().url(), z.literal("")]).optional(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: "Old password is required",
    }),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
});

export const AuthValidation = {
  loginValidationSchema,
  registerValidationSchema,
  changePasswordValidationSchema,
};
