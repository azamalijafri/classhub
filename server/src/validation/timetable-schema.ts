import { z } from "zod";
import { Day } from "../enums/days";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const upsertTimetableSchema = z.object({
  classroomId: z.string().min(1, "Classroom ID is required"),
  day: z.enum([
    Day.Monday,
    Day.Tuesday,
    Day.Wednesday,
    Day.Thursday,
    Day.Friday,
    Day.Saturday,
    Day.Sunday,
  ]),
  periods: z
    .array(
      z.object({
        subject: z.string().min(1, "Subject is required"),
        startTime: z.string().regex(timeRegex, "Invalid start time format"),
        endTime: z.string().regex(timeRegex, "Invalid end time format"),
      })
    )
    .nonempty("Periods are required"),
});
