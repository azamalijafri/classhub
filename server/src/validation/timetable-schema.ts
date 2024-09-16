import { z } from "zod";
import { Day } from "../enums/days";

const PeriodSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  teacher: z.string().min(1, "Teacher is required"),
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid start time format"),
  endTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid end time format"),
});

const TimetableEntrySchema = z.object({
  day: z.nativeEnum(Day, { errorMap: () => ({ message: "Invalid day" }) }),
  periods: z.array(PeriodSchema),
});

export const updateTimetableSchema = z.object({
  classroomId: z.string().length(24, "Invalid classroom ID"),
  timetableData: z.array(TimetableEntrySchema),
});
