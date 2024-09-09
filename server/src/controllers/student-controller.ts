import { Request, Response } from "express";
import Student from "../models/student";
import { getSchool } from "../libs/utils";

// get all students of a school
export const getAllStudent = async (req: Request, res: Response) => {
  try {

    const school = await getSchool(req);
    const students = await Student.find({school:school._id}).populate("user").populate("classroom");

    res.status(200).json({
      message: "students fetched successfully",
      students,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};
