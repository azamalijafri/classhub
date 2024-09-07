import { z } from "zod";

export const createTeacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

export type CreateTeacherFormValues = z.infer<typeof createTeacherSchema>;
