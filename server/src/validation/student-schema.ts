import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  roll: z.string().min(1, "Roll No is required"),
  classroom: z.string().optional(),
});

export const createBulkStudentSchema = z.object({
  students: z
    .array(createStudentSchema)
    .min(1, "At least one teacher is required"),
  classroom: z.string().optional(),
});

export const updateStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  password: z
    .string()
    .min(6, "Password should be atleast 6 character")
    .optional()
    .or(z.literal("")),
});
