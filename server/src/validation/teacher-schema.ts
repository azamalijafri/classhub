import { z } from "zod";

export const createTeacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  subject: z.string().min(1, "Subject is required"),
});

export const createBulkTeacherSchema = z.object({
  teachers: z
    .array(createTeacherSchema)
    .min(1, "At least one teacher is required"),
});

export const updateTeacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  subject: z.string().min(1, "Subject is required"),
});
