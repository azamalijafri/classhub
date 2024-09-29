import { z } from "zod";

export const CreateSingleStudentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  roll: z.string().min(1, "Roll No is Required"),
  password: z
    .string()
    .min(6, "Password should be atleast 6 character")
    .optional()
    .or(z.literal("")),
});

export type CreateStudentFormValues = z.infer<typeof CreateSingleStudentSchema>;

export const CreateBulkStudentSchema = z.object({
  students: z.array(CreateSingleStudentSchema),
});

export type CreateBulkStudentFormValues = z.infer<
  typeof CreateBulkStudentSchema
>;
