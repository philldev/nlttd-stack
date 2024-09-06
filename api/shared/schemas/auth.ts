import { z } from "zod";

export const LoginInputSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export const SignupInputSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(20, "Username must be less than 20 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
