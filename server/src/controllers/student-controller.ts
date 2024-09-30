import { hashPassword } from "./../libs/utils";
import { Request, Response } from "express";
import Student, { IStudent } from "../models/student";
import { delay, getSchool, sendEmail, validate } from "../libs/utils";
import {
  createBulkStudentSchema,
  createStudentSchema,
  updateStudentSchema,
} from "../validation/student-schema";
import { createUserAndProfile } from "./profile-controller";
import { DEFAULT_PAGE_LIMIT } from "../constants/variables";
import AttendanceRecord from "../models/attendance-record";
import StudentAttendance from "../models/student-attendence";
import { attendancePercentageSchema } from "../validation/attendance-schema";
import Classroom from "../models/classroom";
import Subject from "../models/subject";
import { ClientSession, Types } from "mongoose";
import { asyncTransactionWrapper } from "../libs/async-transaction-wrapper";
import { CustomError } from "../libs/custom-error";
import { Schema } from "mongoose";
import ClassroomStudentAssociation from "../models/classroom-student";
import User from "../models/user";

export const createStudent = asyncTransactionWrapper(
  async (req: Request, res: Response, session: ClientSession) => {
    const validatedData = validate(createStudentSchema, req.body, res);
    if (!validatedData) return;

    const { name, email, roll, classroom: classroomId } = validatedData;

    const existingRoll = await Student.findOne({
      roll,
      school: req.user.profile.school,
    });

    if (existingRoll)
      throw new CustomError("Student with this roll already exist", 409);

    const school = await getSchool(req);

    if (classroomId) {
      const classroom = await Classroom.findById(classroomId).session(session);
      if (!classroom) {
        throw new CustomError("Classroom not found", 404);
      }
    }

    await createUserAndProfile({
      name,
      email,
      role: "student",
      school,
      roll,
      classroom: classroomId,
      session,
    });

    res
      .status(201)
      .json({ message: "Student created successfully", showMessage: true });
  }
);

export const createBulkStudents = asyncTransactionWrapper(
  async (req: Request, res: Response, session: ClientSession) => {
    const validatedData = validate(createBulkStudentSchema, req.body, res);

    if (!validatedData) return;

    const { students, classroom: classroomId } = validatedData;

    const school = await getSchool(req);

    if (classroomId) {
      const classroom = await Classroom.findById(classroomId).session(session);
      if (!classroom) {
        throw new CustomError("Classroom not found", 404);
      }
    }

    const emailData: {
      email: string;
      uniqueEmail: string;
      password: string;
    }[] = [];

    const createPromises = students.map(async (student: any) => {
      const { name, email, roll } = student;

      const existingRoll = await Student.findOne({
        roll,
        school: req.user.profile.school,
      });

      if (existingRoll)
        throw new CustomError(`Student with roll ${roll} already exist`, 409);

      try {
        const emailInfo = await createUserAndProfile({
          name,
          email,
          role: "student",
          school,
          roll,
          classroom: classroomId,
          session,
        });

        emailData.push(emailInfo);
      } catch (error: any) {
        throw new CustomError(
          `Error creating student ${name}: ${error.message}`,
          400
        );
      }
    });

    await Promise.all(createPromises);

    for (const { email, uniqueEmail, password } of emailData) {
      await sendEmail(email, uniqueEmail, password);
      // await delay(1000);
    }

    res.status(200).json({
      message: `Students created successfully`,
      showMessage: true,
    });
  }
);

export const getAllStudent = asyncTransactionWrapper(
  async (req: Request, res: Response) => {
    const {
      search,
      class: classroomId,
      page = 1,
      pageLimit = DEFAULT_PAGE_LIMIT,
      sf = "createdAt",
      so = "desc",
    } = req.query;

    const queryOptions: any = {
      school: req.user.profile.school,
      status: 1,
    };

    const matchStage: any = { $match: queryOptions };

    if (search) {
      matchStage.$match.name = { $regex: search, $options: "i" };
    }

    const lookupClassroomAssociationStage: any = {
      $lookup: {
        from: "classroomstudentassociations",
        localField: "_id",
        foreignField: "student",
        as: "classroomAssociations",
      },
    };

    const unwindClassroomAssociationStage: any = {
      $unwind: {
        path: "$classroomAssociations",
        preserveNullAndEmptyArrays: true,
      },
    };

    const lookupClassroomStage: any = {
      $lookup: {
        from: "classrooms",
        localField: "classroomAssociations.classroom",
        foreignField: "_id",
        as: "classrooms",
      },
    };

    const unwindClassroomStage: any = {
      $unwind: {
        path: "$classrooms",
        preserveNullAndEmptyArrays: true,
      },
    };

    const lookupUserStage: any = {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    };

    const unwindUserStage: any = {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    };

    const classroomMatchStage: any = {
      $match: {
        ...(classroomId
          ? { "classrooms._id": new Types.ObjectId(String(classroomId)) }
          : {}),
      },
    };

    const groupStage: any = {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        roll: { $first: "$roll" },
        user: { $first: "$user" },
        classrooms: { $addToSet: "$classrooms" },
        createdAt: { $addToSet: "$createdAt" },
      },
    };

    const sortOptions: any = {};
    if (sf === "classroom") {
      sortOptions["classrooms.name"] = so === "asc" ? 1 : -1;
    } else {
      sortOptions[sf.toString()] = so === "asc" ? 1 : -1;
    }

    const limit =
      pageLimit === "all"
        ? Infinity
        : Math.max(0, parseInt(pageLimit as string, 10));
    const skip = Math.max(0, (parseInt(page as string, 10) - 1) * limit);

    const paginationStage: any = {
      $facet: {
        paginatedResults: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    };

    const pipeline = [
      matchStage,
      lookupClassroomAssociationStage,
      unwindClassroomAssociationStage,
      lookupClassroomStage,
      unwindClassroomStage,
      lookupUserStage,
      unwindUserStage,
      classroomMatchStage,
      groupStage,
      { $sort: sortOptions },
      paginationStage,
    ];

    const result = await Student.aggregate(pipeline);

    const students = result[0]?.paginatedResults || [];
    const totalCount = result[0]?.totalCount[0]?.count || 0;

    res.status(200).json({
      message: "Students fetched successfully",
      students,
      currentPage: parseInt(page as string, 10),
      totalPages: Math.ceil(totalCount / limit),
      totalStudents: totalCount,
    });
  }
);

export const getAllStudentByClass = asyncTransactionWrapper(
  async (req: Request, res: Response) => {
    const { classroomId } = req.params;

    if (!Types.ObjectId.isValid(classroomId)) {
      throw new CustomError("Invalid classroom ID", 400);
    }

    const {
      search,
      page = 1,
      pageLimit = DEFAULT_PAGE_LIMIT,
      sf = "name",
      sortOrder = "asc",
    } = req.query;

    const queryOptions: any = {
      school: req.user.profile.school,
      status: 1,
    };

    const matchStage: any = {
      $match: { ...queryOptions },
    };

    if (search) {
      matchStage.$match.name = { $regex: search, $options: "i" };
    }

    const lookupClassroomAssociationStage: any = {
      $lookup: {
        from: "classroomstudentassociations",
        localField: "_id",
        foreignField: "student",
        as: "classroomAssociation",
      },
    };

    const unwindClassroomAssociationStage: any = {
      $unwind: {
        path: "$classroomAssociation",
        preserveNullAndEmptyArrays: true,
      },
    };

    const lookupUserStage: any = {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    };

    const unwindUserStage: any = {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    };

    const sortOptions: any = {};
    sortOptions[sf.toString()] = sortOrder === "asc" ? 1 : -1;

    const limit =
      pageLimit === "all"
        ? Infinity
        : Math.max(0, parseInt(pageLimit as string, 10));
    const skip = Math.max(0, (parseInt(page as string, 10) - 1) * limit);

    const paginationStage: any = {
      $facet: {
        paginatedResults: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    };

    const pipeline = [
      matchStage,
      lookupClassroomAssociationStage,
      unwindClassroomAssociationStage,
      lookupUserStage,
      unwindUserStage,
      {
        $match: {
          "classroomAssociation.classroom": new Types.ObjectId(classroomId),
        },
      },
      { $sort: sortOptions },
      paginationStage,
    ];

    const result = await Student.aggregate(pipeline);

    const students = result[0]?.paginatedResults || [];
    const totalCount = result[0]?.totalCount[0]?.count || 0;

    res.status(200).json({
      message: "Students fetched successfully",
      students,
      currentPage: parseInt(page as string, 10),
      totalPages: Math.ceil(totalCount / limit),
      totalStudents: totalCount,
    });
  }
);

export const updateStudent = asyncTransactionWrapper(
  async (req: Request, res: Response, session: ClientSession) => {
    const { studentId } = req.params;

    if (!Types.ObjectId.isValid(studentId)) {
      throw new CustomError("Invalid ID format", 400);
    }

    const student = await Student.findOne({
      _id: studentId,
      school: req.user.profile.school,
    });

    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    const validatedData = validate(updateStudentSchema, req.body, res);
    if (!validatedData) return;

    const { name, password } = validatedData;

    await student.updateOne({ name }, { session });
    if (password) {
      const hashedPassword = await hashPassword(password);
      await User.findByIdAndUpdate(
        student.user,
        { password: hashedPassword },
        { session }
      );
    }

    res
      .status(200)
      .json({ message: "Student updated successfully", showMessage: true });
  }
);

export const kickStudentFromClass = asyncTransactionWrapper(
  async (req: Request, res: Response) => {
    const { studentId, classroomId } = req.query;

    if (
      !Types.ObjectId.isValid(studentId as string) ||
      !Types.ObjectId.isValid(classroomId as string)
    ) {
      throw new CustomError("Invalid ID format", 400);
    }

    const classroom = await Classroom.findOne({
      _id: classroomId,
      mentor: req.user.profile._id,
    });

    if (!classroom) throw new CustomError("Classroom not found", 404);

    const student = await Student.findOne({
      _id: studentId,
      school: req.user.profile.school,
    });

    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    await ClassroomStudentAssociation.findOneAndDelete({
      student: studentId,
      classroom: classroomId,
    });

    res
      .status(200)
      .json({ message: "Student kicked successfully", showMessage: true });
  }
);

export const removeStudentFromSchool = asyncTransactionWrapper(
  async (req: Request, res: Response) => {
    const { studentId } = req.params;

    if (!Types.ObjectId.isValid(studentId)) {
      throw new CustomError("Invalid ID format", 400);
    }

    const student = await Student.findOneAndUpdate(
      { _id: studentId, school: req.user.profile.school },
      { status: 0, classroom: null },
      { new: true }
    );

    if (!student) {
      throw new CustomError("Student not found", 404);
    }

    res
      .status(200)
      .json({ message: "Student removed successfully", showMessage: true });
  }
);

export const getAttendancePercentage = asyncTransactionWrapper(
  async (req: Request, res: Response) => {
    try {
      const validatedData = validate(attendancePercentageSchema, req.body, res);

      if (!validatedData) return;

      const { studentId, subjectId, classroomId } = validatedData;

      if (
        !Types.ObjectId.isValid(studentId) ||
        !Types.ObjectId.isValid(subjectId) ||
        !Types.ObjectId.isValid(classroomId)
      ) {
        return res.status(400).json({ message: "Invalid ID format." });
      }

      const [classroom, subject, student, totalSessions] = await Promise.all([
        Classroom.findById(classroomId),
        Subject.findById(subjectId),
        Student.findById(studentId),
        AttendanceRecord.countDocuments({ subject: subjectId }),
      ]);

      if (!classroom)
        return res.status(404).json({ error: "Classroom not found" });
      if (!subject) return res.status(404).json({ error: "Subject not found" });
      if (!student) return res.status(404).json({ error: "Student not found" });

      const attendedSessions = await StudentAttendance.countDocuments({
        student: studentId,
        attendance: {
          $in: await AttendanceRecord.find({ subject: subjectId }).distinct(
            "_id"
          ),
        },
        status: 1,
      });

      const attendancePercentage = (attendedSessions / totalSessions) * 100;

      res.status(200).json({
        totalSessions,
        attendedSessions,
        attendancePercentage: attendancePercentage.toFixed(2),
      });
    } catch (error) {
      console.error("Error fetching attendance percentage: ", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);
