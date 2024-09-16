import { Request, Response } from "express";
import Student from "../models/student";
import { getSchool, validate } from "../libs/utils";
import {
  createStudentSchema,
  updateStudentSchema,
} from "../validation/student-schema";
import { createUserAndProfile } from "./profile-controller";

export const createStudent = async (req: Request, res: Response) => {
  const validatedData = validate(createStudentSchema, req.body, res);

  if (!validatedData) return;

  const { name, email, roll } = validatedData;

  try {
    const school = await getSchool(req);
    await createUserAndProfile({
      name,
      email,
      role: "student",
      res,
      school,
      roll,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllStudent = async (req: Request, res: Response) => {
  try {
    const students = await Student.find({
      school: req.user.profile.school,
      status: 1,
    })
      .populate("user")
      .populate("classroom");

    res.status(200).json({
      message: "students fetched successfully",
      students,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};

export const getAllStudentByClass = async (req: Request, res: Response) => {
  try {
    const { classroomId } = req.params;
    const students = await Student.find({ classroom: classroomId }).populate(
      "user"
    );

    res.status(200).json({
      message: "students fetched successfully",
      students,
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

    await student.updateOne({ status: 0 });
    await student.save();

    res
      .status(200)
      .json({ message: "Student removed successfully", showMessage: true });
  } catch (error) {
    res.status(500).json({ message: "Error removing student", error });
  }
};
