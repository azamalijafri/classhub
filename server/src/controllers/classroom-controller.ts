import { Request, Response } from "express";
import Classroom from "../models/classroom";
import {
  assignStudentSchema,
  assignTeacherSchema,
  createClassroomSchema,
} from "../validation/classroom-schema";
import { Types } from "mongoose";
import Teacher from "../models/teacher";
import Student from "../models/student";

export const createClassroom = async (req: Request, res: Response) => {
  try {
    const result = createClassroomSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.errors.map((err) => ({
          path: err.path,
          message: err.message,
        })),
      });
    }

    const { name, days } = result.data;

    const existingClassroom = await Classroom.findOne({ name });

    if (existingClassroom)
      return res.status(409).json({
        message: "Classroom with this name already exist",
      });

    const classroom = new Classroom({
      name,
      days,
    });

    await classroom.save();
    return res.status(201).json({
      message: "Classroom created successfully",
      classroom,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error creating classroom", error });
  }
};

export const assignTeacherToClassroom = async (req: Request, res: Response) => {
  const result = assignTeacherSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.errors,
    });
  }

  const { teacherId, classroomId } = result.data;

  try {
    const teacher = await Teacher.findOne({ _id: teacherId, role: "teacher" });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const existingClassroom = await Classroom.findOne({ teacher: teacherId });

    if (existingClassroom) {
      return res
        .status(400)
        .json({ message: "Teacher is already assigned to a classroom" });
    }

    const classroom = await Classroom.findById(classroomId);

    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    if (classroom.teacher)
      return res.status(500).json({
        message: "This classroom has already been assigned to a teacher",
      });

    classroom.teacher = new Types.ObjectId(teacherId);
    await classroom.save();

    return res.status(200).json({
      message: "Teacher assigned to classroom successfully",
      classroom,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error assigning teacher to classroom",
      error,
    });
  }
};

export const assignStudentToClassroom = async (req: Request, res: Response) => {
  try {
    const { studentId, classroomId } = assignStudentSchema.parse(req.body);

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found" });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (student.classroom) {
      return res
        .status(400)
        .json({ message: "Student is already assigned to a classroom" });
    }

    await classroom.save();

    student.classroom = new Types.ObjectId(classroomId);
    await student.save();

    res.status(200).json({
      message: "Student assigned to classroom successfully",
      classroom,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error assigning student to classroom", error });
  }
};
