import { Request, Response } from "express";
import Teacher from "../models/teacher";

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await Teacher.find().populate("user");

    res.status(200).json({
      message: "Teachers fetched successfully",
      teachers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching teachers", error });
  }
};
