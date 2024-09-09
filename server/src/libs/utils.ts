import { Request } from "express";
import School from "../models/school";

export const getSchool = async (req: Request) => {
  const school = await School.findOne({ id: req.user.profile.school });
  if (school) {
    return school;
  } else {
    throw new Error("School not found");
  }
};
