import { z } from "zod";

export const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createTeacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export const createStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  roll: z.string().min(1, "Roll No is required"),
});

export const updateStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  roll: z.string().min(1, "Roll No is required"),
});
