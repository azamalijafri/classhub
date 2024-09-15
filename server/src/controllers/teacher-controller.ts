import { Request, Response } from "express";
import Teacher, { ITeacher } from "../models/teacher";
import { getSchool, validate } from "../libs/utils";
import { createUserAndProfile } from "./profile-controller";
import {
  createBulkTeacherSchema,
  createTeacherSchema,
} from "../validation/teacher-schema";
import Subject from "../models/subject";
import Classroom, { IClassroom } from "../models/classroom";

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const teachers: (ITeacher & { classroom: IClassroom })[] =
      await Teacher.find().populate("user").lean();

    for (let teacher of teachers) {
      const classroom = await Classroom.findOne({ teacher: teacher._id });
      if (classroom) teacher.classroom = classroom;
    }

    res.status(200).json({
      message: "Teachers fetched successfully",
      teachers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching teachers", error });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  const validatedData = validate(createTeacherSchema, req.body, res);

  if (!validatedData) return;

  const { name, email, subject } = validatedData;

  const doesSubjectExist = await Subject.findOne({
    _id: subject,
    school: req.user.profile.school,
  });

  if (!doesSubjectExist)
    return res.status(404).json({ message: "subject doesnt exist" });

  try {
    const school = await getSchool(req);

    await createUserAndProfile({
      name,
      email,
      role: "teacher",
      res,
      school,
      subject,
    });

    res
      .status(200)
      .json({ message: "Teacher created successfully", showMessage: true });
  } catch (error: any) {
    console.log("create-teacher: ", error);
    res.status(500).json({ message: error.message });
  }
};

export const createBulkTeachers = async (req: Request, res: Response) => {
  const validatedData = validate(createBulkTeacherSchema, req.body, res);

  if (!validatedData) return;

  const { teachers } = validatedData;

  try {
    const school = await getSchool(req);

    const failedTeachers: { name: string; email: string; reason: string }[] =
      [];
    const createdTeachers: { name: string; email: string }[] = [];

    for (const teacher of teachers) {
      const { name, email, subject } = teacher;

      const doesSubjectExist = await Subject.findOne({
        name: subject,
        school: req.user.profile.school,
      });

      if (!doesSubjectExist) {
        failedTeachers.push({
          name,
          email,
          reason: "Subject doesn't exist",
        });
        continue;
      }

      try {
        await createUserAndProfile({
          name,
          email,
          role: "teacher",
          res,
          school,
          subject: doesSubjectExist?._id?.toString(),
        });

        createdTeachers.push({ name, email });
      } catch (error: any) {
        failedTeachers.push({
          name,
          email,
          reason: error.message || "Error creating teacher",
        });
      }
    }

    return res.status(200).json({
      message: `${createdTeachers.length} teacher(s) created successfully`,
      createdTeachers,
      failedTeachers,
    });
  } catch (error: any) {
    console.log("create-bulk-teachers: ", error);
    res.status(500).json({ message: error.message });
  }
};
