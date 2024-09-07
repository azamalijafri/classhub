import { z } from "zod";

export const registerSchema = z.object({
  schoolName: z.string().min(1, "School name is required."),
  schoolCode: z.string().min(1, "School code is required."),
  principalName: z.string().min(1, "Principal name is required."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters long."),
});
