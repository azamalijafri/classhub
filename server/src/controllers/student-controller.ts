import { Request, Response } from "express";
import Student from "../models/student";
import { getSchool, validate } from "../libs/utils";
import {
  createBulkStudentSchema,
  createStudentSchema,
  updateStudentSchema,
} from "../validation/student-schema";
import { createUserAndProfile } from "./profile-controller";
import { DEFAULT_PAGE_LIMIT } from "../constants/variables";
import AttendanceRecord from "../models/attendance-record";
import StudentAttendance from "../models/student-attendence";
import { z } from "zod";
import { attendancePercentageSchema } from "../validation/attendance-schema";
import Classroom from "../models/classroom";
import Subject from "../models/subject";
import { startSession, Types } from "mongoose";

export const createStudent = async (req: Request, res: Response) => {
  const session = await startSession();
  session.startTransaction();

  const validatedData = validate(createStudentSchema, req.body, res);
  if (!validatedData) {
    await session.endSession();
    return;
  }

  const { name, email, roll, classroom: classroomId } = validatedData;

  try {
    const school = await getSchool(req);

    if (classroomId) {
      const classroom = await Classroom.findById(classroomId).session(session);
      if (!classroom) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Classroom not found" });
      }
    }

    await createUserAndProfile({
      name,
      email,
      role: "student",
      res,
      school,
      roll,
      classroom: classroomId,
      session,
    });

    await session.commitTransaction();
    res
      .status(201)
      .json({ message: "Student created successfully", showMessage: true });
  } catch (error: any) {
    await session.abortTransaction();
    console.error(`Error creating student: ${error.message}`);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    await session.endSession();
  }
};

export const createBulkStudents = async (req: Request, res: Response) => {
  const validatedData = validate(createBulkStudentSchema, req.body, res);

  if (!validatedData) return;

  const { students, classroom: classroomId } = validatedData;

  const session = await startSession();
  session.startTransaction();

  try {
    const school = await getSchool(req);

    if (classroomId) {
      const classroom = await Classroom.findById(classroomId).session(session);
      if (!classroom) {
        await session.abortTransaction();
        return res.status(404).json({ message: "Classroom not found" });
      }
    }

    const createdStudents: { name: string; email: string }[] = [];

    for (const student of students) {
      const { name, email, roll } = student;
      try {
        await createUserAndProfile({
          name,
          email,
          role: "student",
          res,
          school,
          roll,
          classroom: classroomId,
          session,
        });
        createdStudents.push({ name, email });
      } catch (error: any) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Error creating student ${name}: ${error.message}`,
        });
      }
    }

    if (createdStudents.length == students.length) {
      await session.commitTransaction();

      return res.status(200).json({
        message: `Students created successfully`,
        showMessage: true,
      });
    } else {
      session.abortTransaction();
      return res.status(500).json({
        message: "No students created. Transaction aborted due to errors.",
      });
    }
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error creating bulk students:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    await session.endSession();
  }
};

export const getAllStudent = async (req: Request, res: Response) => {
  try {
    const {
      search,
      class: classroomId,
      page = 1,
      pageLimit = DEFAULT_PAGE_LIMIT,
      sortField = "name",
      sortOrder = "asc",
    } = req.query;

    const queryOptions: any = {
      school: req.user.profile.school,
      status: 1,
    };

    if (search) {
      queryOptions.name = { $regex: search, $options: "i" };
    }

    if (classroomId && !Types.ObjectId.isValid(classroomId.toString())) {
      return res.status(400).json({ message: "Invalid classroom ID format." });
    }

    if (classroomId) {
      queryOptions.classroom = classroomId;
    }

    const limit = Math.max(0, parseInt(pageLimit as string, 10));
    const skip = Math.max(0, (parseInt(page as string, 10) - 1) * limit);

    const sortOptions: any = {};
    if (sortField && (sortOrder === "asc" || sortOrder === "desc")) {
      sortOptions[sortField as string] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions["createdAt"] = -1;
    }

    const students = await Student.find(queryOptions)
      .populate("user")
      .populate("classroom")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const totalStudents = await Student.countDocuments(queryOptions);

    res.status(200).json({
      message: "Students fetched successfully",
      students,
      currentPage: parseInt(page as string, 10),
      totalPages: Math.ceil(totalStudents / limit),
      totalStudents,
    });
  } catch (error) {
    console.error("Error fetching all students:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
};

export const getAllStudentByClass = async (req: Request, res: Response) => {
  try {
    const { classroomId } = req.params;

    if (!Types.ObjectId.isValid(classroomId)) {
      return res.status(400).json({ message: "Invalid classroom ID format." });
    }

    const {
      search,
      page = 1,
      pageLimit = DEFAULT_PAGE_LIMIT,
      sortOrder = "asc",
      sortField = "name",
    } = req.query;

    const queryOptions: any = {
      school: req.user.profile.school,
      status: 1,
      classroom: classroomId,
    };

    if (search) {
      queryOptions.name = { $regex: search, $options: "i" };
    }

    const limit =
      pageLimit === "all"
        ? Infinity
        : Math.max(0, parseInt(pageLimit as string, 10));
    const skip = Math.max(0, (parseInt(page as string, 10) - 1) * limit);

    const sortOptions: any = {};
    if (sortField && (sortOrder === "asc" || sortOrder === "desc")) {
      sortOptions[sortField as string] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions["name"] = 1;
    }

    const students = await Student.find(queryOptions)
      .populate("user")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    const totalStudents = await Student.countDocuments(queryOptions);

    res.status(200).json({
      message: "Students fetched successfully",
      students,
      totalStudents,
    });
  } catch (error) {
    console.error("Error fetching class students:", error);
    res.status(500).json({ message: "Error fetching students" });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  const { studentId } = req.params;

  if (!Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({ message: "Invalid student ID format" });
  }

  const student = await Student.findById(studentId);

  if (!student) {
    return res
      .status(404)
      .json({ message: `Student not found with ID: ${studentId}` });
  }

  const validatedData = validate(updateStudentSchema, req.body, res);
  if (!validatedData) return;

  const { name } = validatedData;

  try {
    await student.updateOne({ name });
    res
      .status(200)
      .json({ message: "Student updated successfully", showMessage: true });
  } catch (error) {
    console.error("Error updating student: ", error);
    res.status(500).json({ message: "Error updating student" });
  }
};

export const kickStudentFromClass = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    if (!Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID format." });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      { classroom: null },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res
      .status(200)
      .json({ message: "Student kicked successfully", showMessage: true });
  } catch (error) {
    console.error("Error kicking student: ", error);
    res.status(500).json({ message: "Error kicking student" });
  }
};

export const removeStudentFromSchool = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    if (!Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid student ID format." });
    }

    const student = await Student.findByIdAndUpdate(
      studentId,
      { status: 0, classroom: null },
      { new: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res
      .status(200)
      .json({ message: "Student removed successfully", showMessage: true });
  } catch (error) {
    console.error("Error removing student: ", error);
    res.status(500).json({ message: "Error removing student" });
  }
};

export const getAttendancePercentage = async (req: Request, res: Response) => {
  try {
    const validatedData = validate(attendancePercentageSchema, req.body, res);

    if (!validatedData) return;

    const { studentId, subjectId, classroomId } = validatedData;

    if (
      !Types.ObjectId.isValid(studentId) ||
      !Types.ObjectId.isValid(subjectId) ||
      !Types.ObjectId.isValid(classroomId)
    ) {
      return res.status(400).json({ message: "Invalid ID format." });
    }

    const [classroom, subject, student, totalSessions] = await Promise.all([
      Classroom.findById(classroomId),
      Subject.findById(subjectId),
      Student.findById(studentId),
      AttendanceRecord.countDocuments({ subject: subjectId }),
    ]);

    if (!classroom)
      return res.status(404).json({ error: "Classroom not found" });
    if (!subject) return res.status(404).json({ error: "Subject not found" });
    if (!student) return res.status(404).json({ error: "Student not found" });
    if (totalSessions === 0)
      return res
        .status(404)
        .json({ error: "No sessions found for this subject" });

    const attendedSessions = await StudentAttendance.countDocuments({
      student: studentId,
      attendance: {
        $in: await AttendanceRecord.find({ subject: subjectId }).distinct(
          "_id"
        ),
      },
      status: 1,
    });

    const attendancePercentage = (attendedSessions / totalSessions) * 100;

    res.status(200).json({
      totalSessions,
      attendedSessions,
      attendancePercentage: attendancePercentage.toFixed(2),
    });
  } catch (error) {
    console.error("Error fetching attendance percentage: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
