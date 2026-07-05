import { z } from "zod";

export const requestFormSchema = z.object({
  name: z.string().trim().min(1, "Full Name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email format"),
  mobile_number: z
    .string()
    .trim()
    .min(1, "Phone Number is required")
    .regex(/^\+?[\d\s-]{7,15}$/, "Invalid phone number"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters"),
});


