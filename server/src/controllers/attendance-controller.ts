import { ClientSession, Types } from "mongoose";
import { Request, Response } from "express";
import AttendanceRecord from "../models/attendance-record";
import Classroom from "../models/classroom";
import { markAttendanceSchema } from "../validation/attendance-schema";
import Subject from "../models/subject";
import Teacher from "../models/teacher";
import StudentAttendance from "../models/student-attendence";
import { validate } from "../libs/utils";
import Student from "../models/student";
import { asyncTransactionWrapper } from "../libs/async-transaction-wrapper";
import { CustomError } from "../libs/custom-error";
import Timetable from "../models/timetable";
import ClassroomStudentAssociation from "../models/classroom-student";

export const markAttendance = asyncTransactionWrapper(
  async (req: Request, res: Response, session: ClientSession) => {
    const validatedData = validate(markAttendanceSchema, req.body, res);
    if (!validatedData) return;

    const { classroomId, subjectId, date, students, periodId } = validatedData;

    const [classroom, subject] = await Promise.all([
      Classroom.findById(classroomId).session(session),
      Subject.findById(subjectId).session(session),
    ]);

    if (!classroom) throw new CustomError("Classroom not found", 404);
    if (!subject) throw new CustomError("Subject not found", 404);

    const timetable = await Timetable.findOne({
      classroom: classroomId,
    }).session(session);

    if (!timetable) throw new CustomError("Timetable not found", 404);

    const period = timetable?.periods?.find(
      (p) => p.id?.toString() === periodId
    );

    if (!period || String(period.teacher) !== String(req.user.profile._id)) {
      throw new CustomError("You are not assigned to this period", 403);
    }

    const studentIds = students.map((s: { studentId: string }) => s.studentId);

    const validAssociations = await ClassroomStudentAssociation.find({
      classroom: classroomId,
      student: { $in: studentIds },
    }).session(session);

    if (validAssociations.length !== students.length) {
      throw new CustomError(
        "Some Students are Invalid or not associated with the classroom",
        400
      );
    }

    const attendance = new AttendanceRecord({
      classroom: classroomId,
      subject: subjectId,
      period: periodId,
      date,
    });
    await attendance.save({ session });

    const attendanceRecords = students.map(
      ({ studentId, status }: { studentId: string; status: string }) => ({
        attendance: attendance._id,
        student: studentId,
        status: parseInt(status, 10),
      })
    );

    await StudentAttendance.insertMany(attendanceRecords, { session });

    res.status(200).json({
      message: "Attendance marked successfully",
      showMessage: true,
    });
  }
);
