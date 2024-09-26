import { z } from "zod";

export const registerSchema = z.object({
  schoolName: z.string().min(1, "School Name is required"),
  code: z.string().min(1, "School Code is required"),
  principalName: z.string().min(1, "Principal Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password should be minimum of 6 characters"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
