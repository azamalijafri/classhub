import { Request, Response } from "express";
import Student from "../models/student";
import { getSchool } from "../libs/utils";

// get all students of a school
export const getAllStudent = async (req: Request, res: Response) => {
  try {
    const students = await Student.find({ school: req.user.profile.school })
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
