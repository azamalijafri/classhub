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
import Timetable, { IPeriod } from "../models/timetable";
import dayjs from "dayjs";
import Attendance from "../models/attendance";

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const {
      search,
      class: classId,
      page = 1,
      pageLimit = DEFAULT_PAGE_LIMIT,
      subject: subjectId,
      sortField,
      sortOrder,
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

    const sortOptions: any = {};
    if (sortField && (sortOrder === "asc" || sortOrder === "desc")) {
      sortOptions[sortField as string] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions["createdAt"] = -1;
    }

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
      { $sort: sortOptions },
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

export const getMyClassroom = async (req: Request, res: Response) => {
  const classroom = await Classroom.findOne({
    teacher: req.user.profile._id,
  }).populate("teacher");

  return res.status(200).json({ classroom });
};

export const getMySchedule = async (req: Request, res: Response) => {
  const teacherId = req.user.profile._id as string;

  if (!Types.ObjectId.isValid(teacherId)) {
    return res.status(400).json({ error: "Invalid teacher ID" });
  }

  try {
    const timetables = await Timetable.find({ "periods.teacher": teacherId })
      .populate("classroom", "name")
      .populate("periods.teacher", "name")
      .populate("periods.subject", "name")
      .sort({ "periods.startTime": 1 });

    const startOfWeek = dayjs().startOf("week").toDate();
    const endOfWeek = dayjs().endOf("week").toDate();

    const groupedByDay = await Promise.all(
      timetables.map(async (timetable) => {
        const { day, periods, classroom } = timetable;

        const sortedPeriods = periods.sort((a, b) => {
          const timeA = Date.parse(`1970-01-01T${a.startTime}:00Z`);
          const timeB = Date.parse(`1970-01-01T${b.startTime}:00Z`);
          return timeA - timeB;
        });

        const periodsWithAttendanceFlag = await Promise.all(
          sortedPeriods.map(async (period) => {
            const attendanceExists = await Attendance.exists({
              period: period._id,
              date: { $gte: startOfWeek, $lte: endOfWeek },
            });

            return {
              ...period.toObject(),
              classroom,
              attendanceTaken: !!attendanceExists,
            };
          })
        );

        return { day, periods: periodsWithAttendanceFlag };
      })
    );

    const groupedSchedule = groupedByDay.reduce((acc, { day, periods }) => {
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day] = acc[day].concat(periods);
      return acc;
    }, {} as Record<string, IPeriod[]>);

    res.json(groupedSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
