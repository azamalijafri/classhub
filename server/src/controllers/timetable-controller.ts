import { Request, Response } from "express";
import Timetable, { IPeriod, ITimetable } from "../models/timetable";
import Classroom from "../models/classroom";
import { updateTimetableSchema } from "../validation/timetable-schema";
import { validate } from "../libs/utils";
import Teacher from "../models/teacher";
import Subject from "../models/subject";

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
    const validatedData = validate(updateTimetableSchema, req.body, res);

    if (!validatedData) return;

    const { classroomId, timetableData } = validatedData;

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (
      req.user.role !== "principal" &&
      classroom.mentor?.toString() !== req.user._id?.toString()
    ) {
      return res.status(403).json({
        message: "Access denied. You are not assigned to this classroom.",
      });
    }

    for (const { day, periods } of timetableData) {
      // Validate periods
      for (const period of periods) {
        const teacher = await Teacher.findById(period.teacher);

        if (!teacher) {
          return res.status(404).json({ message: "Teacher not found" });
        }

        const subject = await Subject.findById(period.subject);

        if (!subject) {
          return res.status(404).json({ message: "subject not found" });
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
      showMessage: true,
    });
  } catch (error) {
    console.log("timetable-update: ", error);

    return res.status(500).json({ message: "Server error", error });
  }
};

export const getTimetable = async (req: Request, res: Response) => {
  try {
    const { classroomId } = req.params;
    const timetable = await Timetable.find({ classroom: classroomId })
      .populate({
        path: "periods.teacher",
        select: "name",
      })
      .populate({
        path: "periods.subject",
        select: "name",
      });

    if (!timetable)
      return res.status(404).json({ message: "Timetable not found" });

    res.status(200).json({ timetable });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ message: "Server error", error });
  }
};
