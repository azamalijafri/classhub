import { z } from "zod";
import { Types } from "mongoose";

export const createClassroomSchema = z.object({
  name: z.string().min(1, "Classroom name is required"),
  subjects: z.array(
    z.string().refine((id) => Types.ObjectId.isValid(id), {
      message: "Invalid subject ID",
    })
  ),
});

export const assignTeacherSchema = z.object({
  teacherId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: "Invalid teacher ID",
  }),
  classroomId: z.string().min(1, "Classroom ID is required"),
});

export const assignStudentsSchema = z.object({
  studentsIds: z
    .array(
      z.string().refine((id) => Types.ObjectId.isValid(id), {
        message: "Invalid student ID",
      })
    )
    .nonempty("At least one student must be selected"),
  classroomId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: "Invalid classroom ID",
  }),
});
