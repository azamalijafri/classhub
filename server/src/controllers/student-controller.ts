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
import Attendance from "../models/attendance";
import StudentAttendance from "../models/student-attendence";
import { z } from "zod";
import { attendancePercentageSchema } from "../validation/attendance-schema";
import Classroom from "../models/classroom";
import Subject from "../models/subject";

export const createStudent = async (req: Request, res: Response) => {
  const validatedData = validate(createStudentSchema, req.body, res);

  if (!validatedData) return;

  const { name, email, roll, classroom: classId } = validatedData;

  try {
    const school = await getSchool(req);

    if (classId) {
      const classroom = await Classroom.findById(classId);
      if (!classroom)
        return res.status(400).json({ message: "class not found" });
    }

    await createUserAndProfile({
      name,
      email,
      role: "student",
      res,
      school,
      roll,
      classroom: classId,
    });

    res
      .status(200)
      .json({ message: "Student created successfully", showMessage: true });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createBulkStudents = async (req: Request, res: Response) => {
  const validatedData = validate(createBulkStudentSchema, req.body, res);

  if (!validatedData) return;

  const { students, classroom: classId } = validatedData;

  if (classId) {
    const classroom = await Classroom.findById(classId);
    if (!classroom) return res.status(400).json({ message: "class not found" });
  }

  try {
    const school = await getSchool(req);

    const failedStudents: { name: string; email: string; reason: string }[] =
      [];
    const createdStudents: { name: string; email: string }[] = [];

    await Promise.all(
      students.map(
        async (student: { name: string; email: string; roll: string }) => {
          const { name, email, roll } = student;
          try {
            await createUserAndProfile({
              name,
              email,
              role: "student",
              res,
              school,
              roll,
              classroom: classId,
            });
            createdStudents.push({ name, email });
          } catch (error: any) {
            failedStudents.push({
              name,
              email,
              reason: error.message || "Error creating student",
            });
          }
        }
      )
    );

    return res.status(200).json({
      message: `${createdStudents.length} student(s) created successfully`,
      createdStudents,
      failedStudents,
      showMessage: true,
    });
  } catch (error: any) {
    console.log("create-bulk-students: ", error);
    res.status(500).json({ message: error.message });
  }
};

export const getAllStudent = async (req: Request, res: Response) => {
  try {
    const {
      search,
      class: classId,
      page = 1,
      pageLimit = DEFAULT_PAGE_LIMIT,
      sortField = "name",
      sortOrder = 1,
    } = req.query;

    const queryOptions: any = {
      school: req.user.profile.school,
      status: 1,
    };

    if (search) {
      queryOptions.name = { $regex: search, $options: "i" };
    }

    if (classId) {
      queryOptions.classroom = classId;
    }

    const limit = parseInt(pageLimit as string, 10);
    const skip = (parseInt(page as string, 10) - 1) * limit;

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
    res.status(500).json({ message: "Error fetching students", error });
  }
};

export const getAllStudentByClass = async (req: Request, res: Response) => {
  try {
    const { classroomId } = req.params;
    const {
      search,
      page = 1,
      pageLimit = DEFAULT_PAGE_LIMIT,
      sortOrder,
      sortField,
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
      pageLimit == "all" ? Infinity : parseInt(pageLimit as string, 10);
    const skip = (parseInt(page as string, 10) - 1) * limit;

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
      message: "students fetched successfully",
      students,
      totalStudents,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};

export const updateStudent = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const validatedData = validate(updateStudentSchema, req.body, res);

    if (!validatedData) return;

    const { name } = validatedData;

    await student.updateOne({ name });
    await student.save();

    res
      .status(200)
      .json({ message: "Student updated successfully", showMessage: true });
  } catch (error) {
    res.status(500).json({ message: "Error updating student", error });
  }
};

export const kickStudentFromClass = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await student.updateOne({ classroom: null });
    await student.save();

    res
      .status(200)
      .json({ message: "Student kicked successfully", showMessage: true });
  } catch (error) {
    res.status(500).json({ message: "Error kicking student", error });
  }
};

export const removeStudentFromSchool = async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await student.updateOne({ status: 0, classroom: null });
    await student.save();

    res
      .status(200)
      .json({ message: "Student removed successfully", showMessage: true });
  } catch (error) {
    res.status(500).json({ message: "Error removing student", error });
  }
};

export const getAttendancePercentage = async (req: Request, res: Response) => {
  try {
    const validatedData = validate(attendancePercentageSchema, req.body, res);

    if (!validatedData) return;

    const { studentId, subjectId, classId } = validatedData;

    const classroom = await Classroom.findById(classId);
    if (!classroom)
      return res.status(404).json({ error: "Classroom not found" });

    const subject = await Subject.findById(subjectId);
    if (!subject) return res.status(404).json({ error: "Subject not found" });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const totalSessions = await Attendance.countDocuments({
      subject: subjectId,
    });

    if (totalSessions === 0) {
      return res
        .status(404)
        .json({ error: "No sessions found for this subject" });
    }

    const attendedSessions = await StudentAttendance.countDocuments({
      student: studentId,
      attendance: {
        $in: await Attendance.find({ subject: subjectId }).distinct("_id"),
      },
      status: 1,
    });

    const attendancePercentage = (attendedSessions / totalSessions) * 100;

    res.status(200).json({
      studentId,
      subjectId,
      totalSessions,
      attendedSessions,
      attendancePercentage: attendancePercentage.toFixed(2),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
