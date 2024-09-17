import { Request, Response } from "express";
import Teacher, { ITeacher } from "../models/teacher";
import { getSchool, validate } from "../libs/utils";
import { createUserAndProfile } from "./profile-controller";
import {
  createBulkTeacherSchema,
  createTeacherSchema,
  updateTeacherSchema,
} from "../validation/teacher-schema";
import Subject from "../models/subject";
import Classroom, { IClassroom } from "../models/classroom";
import { DEFAULT_PAGE_LIMIT } from "../constants/variables";
import { Types } from "mongoose";

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const {
      search,
      class: classId,
      page = 1,
      pageLimit = DEFAULT_PAGE_LIMIT,
      subject: subjectId,
    } = req.query;

    const queryOptions: any = {
      school: req.user.profile.school,
      status: 1,
    };

    if (search) {
      queryOptions.name = { $regex: search, $options: "i" };
    }

    if (subjectId) {
      queryOptions.subject = new Types.ObjectId(subjectId as string);
    }

    const limit = parseInt(pageLimit as string, 10);
    const skip = (parseInt(page as string, 10) - 1) * limit;

    const teachers = await Teacher.aggregate([
      {
        $match: queryOptions,
      },
      {
        $lookup: {
          from: "classrooms",
          localField: "_id",
          foreignField: "teacher",
          as: "classroom",
        },
      },
      {
        $unwind: {
          path: "$classroom",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: classId
          ? { "classroom._id": new Types.ObjectId(classId as string) }
          : {},
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "subjects",
          localField: "subject",
          foreignField: "_id",
          as: "subject",
        },
      },
      {
        $unwind: {
          path: "$subject",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { name: 1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const totalTeachers = await Teacher.countDocuments(queryOptions);

    res.status(200).json({
      message: "Teachers fetched successfully",
      teachers,
      totalTeachers,
    });
  } catch (error) {
    console.log(error);

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

    await Promise.all(
      teachers.map(
        async (teacher: { name: string; email: string; subject: string }) => {
          const { name, email, subject } = teacher;

          try {
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
              return; // Skip to the next teacher if the subject doesn't exist
            }

            // Create the user and teacher profile
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
      )
    );

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

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "teacher not found" });
    }

    const validatedData = validate(updateTeacherSchema, req.body, res);

    if (!validatedData) return;

    const { name, subject: subjectId } = validatedData;

    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({ message: "subject not found" });
    }

    await teacher.updateOne({ name, subject });
    await teacher.save();

    res
      .status(200)
      .json({ message: "Teacher updated successfully", showMessage: true });
  } catch (error) {
    res.status(500).json({ message: "Error updating teacher", error });
  }
};

export const removeTeacherFromSchool = async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;

    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "teacher not found" });
    }

    const classroom = await Classroom.findOne({ teacher: teacher._id });

    await classroom?.updateOne({ teacher: null });
    await teacher.updateOne({ status: 0 });

    await teacher.save();
    await classroom?.save();

    res
      .status(200)
      .json({ message: "Teacher removed successfully", showMessage: true });
  } catch (error) {
    res.status(500).json({ message: "Error removing teacher", error });
  }
};
