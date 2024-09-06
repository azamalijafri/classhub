import { Request, Response } from "express";
import Student from "../models/student";

export const getAllStudent = async (req: Request, res: Response) => {
  try {
    const students = await Student.find().populate("user");

    res.status(200).json({
      message: "students fetched successfully",
      students,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};
