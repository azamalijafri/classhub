import { Types } from "mongoose";
import { z } from "zod";

export const markAttendanceSchema = z.object({
  classroomId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: "Invalid classroom ID",
  }),
  subjectId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: "Invalid subject ID",
  }),
  periodId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: "Invalid period ID",
  }),
  date: z.string().min(1, "Date is required"),
  students: z.array(
    z.object({
      studentId: z.string().refine((id) => Types.ObjectId.isValid(id), {
        message: "Invalid student ID",
      }),
      status: z.string().min(1, "status is required"),
    })
  ),
});

export const attendancePercentageSchema = z.object({
  studentId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: "Invalid student ID",
  }),
  subjectId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: "Invalid subject ID",
  }),
  classroomId: z.string().refine((id) => Types.ObjectId.isValid(id), {
    message: "Invalid classroom ID",
  }),
});
