import { z } from "zod";

export const createSubjectsSchema = z.object({
  subjects: z.array(
    z.object({
      name: z.string().min(1, "Subject name is required"),
    })
  ),
});
