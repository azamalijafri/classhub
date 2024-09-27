import { Request, Response } from "express";
import Timetable, { IPeriod, ITimetable } from "../models/timetable";
import Classroom from "../models/classroom";
import { updateTimetableSchema } from "../validation/timetable-schema";
import { validate } from "../libs/utils";
import Teacher from "../models/teacher";
import Subject from "../models/subject";
import { asyncTransactionWrapper } from "../libs/async-transaction-wrapper";
import { ClientSession } from "mongoose";
import { CustomError } from "../libs/custom-error";

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

export const updateTimetable = asyncTransactionWrapper(
  async (req: Request, res: Response, session: ClientSession) => {
    const validatedData = validate(updateTimetableSchema, req.body, res);
    if (!validatedData) return;

    const { classroomId, timetableData } = validatedData;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) throw new CustomError("Classroom not found", 404);

    if (
      req.user.role !== "principal" &&
      classroom.mentor?.toString() !== req.user._id?.toString()
    ) {
      throw new CustomError(
        "Access denied. You are not assigned to this classroom.",
        403
      );
    }

    for (const { day, periods } of timetableData) {
      const teachers = await Teacher.find({
        _id: { $in: periods.map((p: any) => p.teacher) },
      }).session(session);
      const subjects = await Subject.find({
        _id: { $in: periods.map((p: any) => p.subject) },
      }).session(session);

      if (teachers.length !== periods.length) {
        throw new CustomError("One or more teachers not found", 404);
      }
      if (subjects.length !== periods.length) {
        throw new CustomError("One or more subjects not found", 404);
      }

      if (periodsOverlap(periods)) {
        throw new CustomError(
          `Periods on ${day} overlap with each other.`,
          400
        );
      }

      let timetable = await Timetable.findOne({
        classroom: classroomId,
        day,
      }).session(session);

      if (timetable) {
        timetable.periods = periods;
      } else {
        timetable = new Timetable({
          classroom: classroomId,
          day,
          periods,
        });
      }

      await timetable.save({ session });
    }

    await session.commitTransaction();
    res.status(200).json({
      message: "Timetable updated successfully",
      showMessage: true,
    });
  }
);

export const getTimetable = asyncTransactionWrapper(
  async (req: Request, res: Response) => {
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

    if (!timetable) throw new CustomError("Timetable not found", 404);

    res.status(200).json({ timetable });
  }
);
