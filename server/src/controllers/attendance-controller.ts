import { Types } from "mongoose";
import { Request, Response } from "express";
import Attendance from "../models/attendance";
import Classroom from "../models/classroom";
import { markAttendanceSchema } from "../validation/attendance-schema";
import { z } from "zod";
import Subject from "../models/subject";
import Teacher from "../models/teacher";
import StudentAttendance from "../models/student-attendence";
import { validate } from "../libs/utils";
import Student from "../models/student";

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const validatedData = validate(markAttendanceSchema, req.body, res);

    if (!validatedData) return;

    const { classroomId, subjectId, teacherId, date, students, periodId } =
      validatedData;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom)
      return res.status(404).json({ error: "Classroom not found" });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ error: "Teacher not found" });

    const studentIds = students.map(
      (s: { studentId: string; status: string }) => s.studentId
    );
    const validStudents = await Student.find({
      _id: { $in: studentIds },
      classroom: classroomId,
    });

    if (validStudents.length !== students.length) {
      return res.status(400).json({ error: "Some students are invalid." });
    }

    const attendance = new Attendance({
      classroom: classroomId,
      subject: subjectId,
      teacher: teacherId,
      period: periodId,
      date,
    });
    await attendance.save();

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

    await StudentAttendance.insertMany(attendanceRecords);

    res
      .status(200)
      .json({ message: "Attendance marked successfully", showMessage: true });
  } catch (error) {
    console.log(error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
