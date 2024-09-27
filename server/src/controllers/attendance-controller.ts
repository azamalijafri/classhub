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

export const markAttendance = asyncTransactionWrapper(
  async (req: Request, res: Response, session: ClientSession) => {
    const validatedData = validate(markAttendanceSchema, req.body, res);
    if (!validatedData) return;

    const { classroomId, subjectId, teacherId, date, students, periodId } =
      validatedData;

    const [classroom, subject, teacher] = await Promise.all([
      Classroom.findById(classroomId).session(session),
      Subject.findById(subjectId).session(session),
      Teacher.findById(teacherId).session(session),
    ]);

    if (!classroom)
      return res.status(404).json({ message: "Classroom not found" });
    if (!subject) return res.status(404).json({ message: "Subject not found" });
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });

    const studentIds = students.map((s: { studentId: string }) => s.studentId);
    const validStudents = await Student.find({
      _id: { $in: studentIds },
      classroom: classroomId,
    }).session(session);

    if (validStudents.length !== students.length) {
      throw new CustomError("Some Students are Invalid", 400);
    }

    const attendance = new AttendanceRecord({
      classroom: classroomId,
      subject: subjectId,
      teacher: teacherId,
      period: periodId,
      date,
    });

    await attendance.save({ session });

    const attendanceRecords = students.map(
      ({
        studentId,
        status,
      }: {
        studentId: Types.ObjectId;
        status: string;
      }) => ({
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
