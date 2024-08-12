import { Request, Response } from "express";
import Classroom from "../models/classroom";
import {
  assignTeacherSchema,
  createClassroomSchema,
} from "../validation/classroom-schema";
import User from "../models/user";
import { Types } from "mongoose";

export const createClassroom = async (req: Request, res: Response) => {
  try {
    const parsedData = createClassroomSchema.parse(req.body);

    const classroom = new Classroom({
      name: parsedData.name,
      startTime: parsedData.startTime,
      endTime: parsedData.endTime,
      days: parsedData.days,
    });

    await classroom.save();
    return res
      .status(201)
      .json({ message: "Classroom created successfully", classroom });
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
    const teacher = await User.findOne({ _id: teacherId, role: "teacher" });

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
