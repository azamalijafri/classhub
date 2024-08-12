import { z } from "zod";
import { Day } from "../enums/days";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createClassroomSchema = z.object({
  name: z.string().min(1, "Classroom name is required"),
  startTime: z.string().regex(timeRegex, "Invalid time format"),
  endTime: z.string().regex(timeRegex, "Invalid time format"),
  days: z
    .array(
      z.enum([
        Day.Monday,
        Day.Tuesday,
        Day.Wednesday,
        Day.Thursday,
        Day.Friday,
        Day.Saturday,
        Day.Sunday,
      ])
    )
    .nonempty("Days are required"),
});

export const assignTeacherSchema = z.object({
  teacherId: z.string().min(1, "Teacher ID is required"),
  classroomId: z.string().min(1, "Classroom ID is required"),
});
