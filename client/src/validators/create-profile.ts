import { z } from "zod";

export const createSingleTeacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
});

export type CreateTeacherFormValues = z.infer<typeof createSingleTeacherSchema>;

export const createBulkTeacherSchema = z.object({
  teachers: z.array(createSingleTeacherSchema),
});

export type CreateBulkFormValues = z.infer<typeof createBulkTeacherSchema>;

export const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  roll: z.string().min(1, "Roll No is Required"),
});

export type CreateStudentFormValues = z.infer<typeof createStudentSchema>;
