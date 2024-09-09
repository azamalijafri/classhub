import { z } from "zod";

export const createTeacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export type CreateTeacherFormValues = z.infer<typeof createTeacherSchema>;

export const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  roll: z.string().min(1, "Roll No is Required"),
});

export type CreateStudentFormValues = z.infer<typeof createStudentSchema>;
