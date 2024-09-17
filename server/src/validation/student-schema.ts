import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  roll: z.string().min(1, "Roll No is required"),
});

export const createBulkStudentSchema = z.object({
  students: z
    .array(createStudentSchema)
    .min(1, "At least one teacher is required"),
});

export const updateStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  // roll: z.string().min(1, "Roll No is required"),
});
