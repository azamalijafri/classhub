import { Types } from "mongoose";
import { z } from "zod";

export const createSubjectsSchema = z.object({
  subjects: z.array(
    z.object({
      name: z.string().min(1, "Subject name is required"),
    })
  ),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  status: z.number().optional(),
});

export const enableDisableSubjectSchema = z.object({
  subjects: z.array(
    z.string().refine((id) => Types.ObjectId.isValid(id), {
      message: "Invalid subject ID",
    })
  ),
});
