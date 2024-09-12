import { Request, Response } from "express";
import School from "../models/school";

export const getSchool = async (req: Request) => {
  const school = await School.findOne({ id: req.user.profile.school });
  if (school) {
    return school;
  } else {
    throw new Error("School not found");
  }
};

export const validate = (
  schema: { safeParse: (arg0: any) => any },
  values: any,
  res: Response
) => {
  const result = schema.safeParse(values);

  if (!result.success) {
    return res.status(400).json({
      message: "Data validation failed",
      errors: result.error.errors.map((item: any) => item.message),
    });
  }

  return result.data;
};
