import { z } from "zod";
import { Day } from "../enums/days";
import { Types } from "mongoose";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createClassroomSchema = z.object({
  name: z.string().min(1, "Classroom name is required"),
  days: z
    .array(
      z.object({
        day: z.enum([
          Day.Monday,
          Day.Tuesday,
          Day.Wednesday,
          Day.Thursday,
          Day.Friday,
          Day.Saturday,
          Day.Sunday,
        ]),
        startTime: z.string().regex(timeRegex, "Invalid time format"),
        endTime: z.string().regex(timeRegex, "Invalid time format"),
      })
    )
    .nonempty("Time slots are required")
    .refine(
      (item) => {
        const days = item.map((slot) => slot.day);
        return new Set(days).size === days.length;
      },
      {
        message: "Duplicate days are not allowed in time slots",
        path: ["days"],
      }
    ),
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
