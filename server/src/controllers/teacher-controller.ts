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
import { startSession, Types } from "mongoose";
import Timetable, { IPeriod } from "../models/timetable";
import dayjs from "dayjs";
import AttendanceRecord from "../models/attendance-record";
import Student from "../models/student";
import StudentAttendance from "../models/student-attendence";

export const getAllTeachers = async (req: Request, res: Response) => {
  const {
    search,
    class: classroomId,
    page = 1,
    pageLimit = DEFAULT_PAGE_LIMIT,
    subject: subjectId,
    sortField = "createdAt",
    sortOrder = "desc",
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

  const limit = Math.max(1, parseInt(pageLimit as string, 10));
  const skip = Math.max(0, (parseInt(page as string, 10) - 1) * limit);

  const sortOptions: any = {
    [sortField.toString()]: sortOrder === "asc" ? 1 : -1,
  };

  try {
    const teachers = await Teacher.aggregate([
      { $match: queryOptions },
      {
        $lookup: {
          from: "classrooms",
          localField: "_id",
          foreignField: "mentor",
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
        $match: classroomId
          ? { "classroom._id": new Types.ObjectId(classroomId as string) }
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

    return res.status(200).json({
      message: "Teachers fetched successfully",
      teachers,
      totalTeachers,
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return res.status(500).json({
      message: "Error fetching teachers",
    });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  const validatedData = validate(createTeacherSchema, req.body, res);
  if (!validatedData) return;

  const { name, email, subject } = validatedData;

  const session = await startSession();
  session.startTransaction();

  try {
    const doesSubjectExist = await Subject.findOne({
      _id: subject,
      school: req.user.profile.school,
    }).session(session);

    if (!doesSubjectExist) {
      await session.abortTransaction();
      return res.status(404).json({ message: "Subject doesn't exist" });
    }

    const school = await getSchool(req);

    await createUserAndProfile({
      name,
      email,
      role: "teacher",
      res,
      school,
      subject,
      session,
    });

    await session.commitTransaction();

    return res.status(201).json({
      message: "Teacher created successfully",
      showMessage: true,
    });
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error creating teacher:", error);
    return res.status(500).json({
      message: "Error creating teacher",
    });
  } finally {
    await session.endSession();
  }
};

export const createBulkTeachers = async (req: Request, res: Response) => {
  const validatedData = validate(createBulkTeacherSchema, req.body, res);
  if (!validatedData) return;

  const { teachers } = validatedData;

  const session = await startSession();
  session.startTransaction();

  try {
    const school = await getSchool(req);
    const createdTeachers: { name: string; email: string }[] = [];

    await Promise.all(
      teachers.map(
        async (teacher: { name: string; email: string; subject: string }) => {
          const { name, email, subject } = teacher;

          try {
            const doesSubjectExist = await Subject.findOne({
              name: subject,
              school: req.user.profile.school,
            }).session(session);

            if (!doesSubjectExist) {
              await session.abortTransaction();
              return res.status(400).json({
                message: `${subject} doesn't exist`,
              });
            }

            await createUserAndProfile({
              name,
              email,
              role: "teacher",
              res,
              school,
              subject,
              session,
            });

            createdTeachers.push({ name, email });
          } catch (error: any) {
            await session.abortTransaction();
            return res.status(400).json({
              message: `Error creating teacher ${name}`,
            });
          }
        }
      )
    );

    if (createdTeachers.length == teachers) {
      await session.commitTransaction();
      return res.status(200).json({
        message: `Teachers created successfully`,
        createdTeachers,
      });
    } else {
      session.abortTransaction();
      return res.status(500).json({
        message: "No teacher created. Transaction aborted due to errors.",
      });
    }
  } catch (error: any) {
    await session.abortTransaction();
    console.error("Error creating bulk teachers:", error);
    return res.status(500).json({
      message: error.message || "Internal Server Error",
    });
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
            const attendanceExists = await AttendanceRecord.exists({
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

export const getMyAttendanceClasses = async (req: Request, res: Response) => {
  const teacherId = req.user.profile._id as string;

  if (!Types.ObjectId.isValid(teacherId)) {
    return res.status(400).json({ error: "Invalid teacher ID" });
  }

  try {
    // Find distinct classrooms where the teacher has taken attendance
    const classrooms = await AttendanceRecord.aggregate([
      { $match: { teacher: new Types.ObjectId(teacherId) } }, // Filter by teacher ID
      { $group: { _id: "$classroom" } }, // Group by classroom
      {
        $lookup: {
          from: "classrooms", // The collection name for classrooms
          localField: "_id",
          foreignField: "_id",
          as: "classroom", // Add classroom details (e.g., name)
        },
      },
      { $unwind: "$classroom" }, // Unwind classroom details
      {
        $project: {
          _id: 1,
          name: "$classroom.name", // Return classroom name (you can add more fields if necessary)
        },
      },
    ]);

    res.json({ classrooms });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMySubjectAttendance = async (req: Request, res: Response) => {
  const teacherId = req.user.profile._id as string;
  const { classroomId } = req.params;
  const { page = 1, limit = DEFAULT_PAGE_LIMIT } = req.query;

  if (
    !Types.ObjectId.isValid(classroomId) ||
    !Types.ObjectId.isValid(teacherId)
  ) {
    return res.status(400).json({ error: "Invalid class or teacher ID" });
  }

  const classroom = await Classroom.findById(classroomId);

  if (!classroom) return res.status(404).json({ message: "class not found" });

  try {
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);

    if (
      isNaN(pageNumber) ||
      isNaN(limitNumber) ||
      pageNumber <= 0 ||
      limitNumber <= 0
    ) {
      return res.status(400).json({ error: "Invalid pagination parameters" });
    }

    const totalItems = await Student.countDocuments({ classroom: classroomId });
    if (totalItems === 0) {
      return res.status(404).json({ error: "No students found in this class" });
    }

    const students = await Student.find({ classroom: classroomId })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .sort({ name: 1 });

    const attendanceRecords = await AttendanceRecord.find({
      classroom: classroomId,
      teacher: teacherId,
    });

    const attendanceRecordsId = attendanceRecords.map((record) => record._id);
    const totalClasses = attendanceRecords.length;

    const attendanceData = await Promise.all(
      students.map(async (student) => {
        const studentPresentCount = await StudentAttendance.countDocuments({
          student: student._id,
          attendance: { $in: attendanceRecordsId },
          status: 1,
        });

        const percentage = totalClasses
          ? ((studentPresentCount / totalClasses) * 100).toFixed(2)
          : "0.00";

        return {
          name: student.name,
          roll: student.roll,
          presentCount: studentPresentCount,
          percentage,
        };
      })
    );

    res.status(200).json({
      attendanceData,
      totalClasses,
      totalItems,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalItems / limitNumber),
      classroom,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
