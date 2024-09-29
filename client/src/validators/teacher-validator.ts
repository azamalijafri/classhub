import { z } from "zod";

export const createSingleTeacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  password: z
    .string()
    .min(6, "Password should be atleast 6 character")
    .optional()
    .or(z.literal("")),
});

export type CreateTeacherFormValues = z.infer<typeof createSingleTeacherSchema>;

export const createBulkTeacherSchema = z.object({
  teachers: z.array(createSingleTeacherSchema),
});

export type CreateBulkTeacherFormValues = z.infer<
  typeof createBulkTeacherSchema
>;
