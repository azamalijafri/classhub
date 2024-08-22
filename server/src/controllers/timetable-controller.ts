import { Request, Response } from "express";
import Timetable, { IPeriod } from "../models/timetable";
import Classroom from "../models/classroom";
import { updateTimetableSchema } from "../validation/timetable-schema";

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const periodsOverlap = (periods: IPeriod[]): boolean => {
  const sortedPeriods = periods.sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  for (let i = 0; i < sortedPeriods.length - 1; i++) {
    if (
      timeToMinutes(sortedPeriods[i].endTime) >
      timeToMinutes(sortedPeriods[i + 1].startTime)
    ) {
      return true;
    }
  }

  return false;
};

export const updateTimetable = async (req: Request, res: Response) => {
  try {
    const result = updateTimetableSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.errors,
      });
    }

    const { classroomId, timetableData } = result.data;

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (
      req.user.role !== "principal" &&
      classroom.teacher?.toString() !== req.user._id?.toString()
    ) {
      return res.status(403).json({
        message: "Access denied. You are not assigned to this classroom.",
      });
    }

    console.log(classroom);

    for (const { day, periods } of timetableData) {
      const timeSlot = classroom.days.find((slot) => slot.day === day);

      if (!timeSlot) {
        return res
          .status(400)
          .json({ message: `No time slot defined for ${day}` });
      }

      // Validate periods
      for (const period of periods) {
        if (
          timeToMinutes(period.startTime) < timeToMinutes(timeSlot.startTime) ||
          timeToMinutes(period.endTime) > timeToMinutes(timeSlot.endTime)
        ) {
          return res.status(400).json({
            message: `Period ${period.subject} on ${day} is outside the classroom's designated time slot.`,
          });
        }
      }

      if (periodsOverlap(periods)) {
        return res.status(400).json({
          message: `Periods on ${day} overlap with each other.`,
        });
      }

      // Upsert timetable entry
      let timetable = await Timetable.findOne({ classroom: classroomId, day });

      if (timetable) {
        timetable.periods = periods;
      } else {
        timetable = new Timetable({
          classroom: classroomId,
          day,
          periods,
        });
      }

      await timetable.save();
    }

    return res.status(200).json({
      message: "Timetable updated successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};

export const getTimetable = async (req: Request, res: Response) => {
  try {
    const { classId } = req.params;

    const timetable = await Timetable.find({ classroom: classId });

    if (!timetable)
      return res.status(404).json({ message: "Timetable not found" });

    res.status(200).json({ timetable });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error });
  }
};
