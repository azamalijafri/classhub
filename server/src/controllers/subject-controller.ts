import { Request, Response } from "express";
import {
  createSubjectsSchema,
  enableDisableSubjectSchema,
  updateSubjectSchema,
} from "../validation/subject-schema";
import Subject, { ISubject } from "../models/subject";
import { validate } from "../libs/utils";
import { asyncTransactionWrapper } from "../libs/async-transaction-wrapper";
import { CustomError } from "../libs/custom-error";
import { ClientSession } from "mongoose";

export const createSubjects = asyncTransactionWrapper(
  async (req: Request, res: Response) => {
    const validatedData = validate(createSubjectsSchema, req.body, res);
    if (!validatedData) return;

    const { subjects } = validatedData;
    const schoolId = req.user.profile.school;

    const existingSubjects = await Subject.find(
      {
        name: { $in: subjects.map((subject: ISubject) => subject.name) },
        school: schoolId,
        status: 1,
      },
      { name: 1 }
    ).lean();

    const existingSubjectNames = new Set(
      existingSubjects.map((subject) => subject.name)
    );

    const subjectsToCreate = subjects
      .filter((subject: ISubject) => !existingSubjectNames.has(subject.name))
      .map((subject: ISubject) => ({
        ...subject,
        school: schoolId,
      }));

    if (subjectsToCreate.length === 0) {
      return res.status(200).json({
        message: "No new subjects to create. All subjects already exist.",
        showMessage: true,
      });
    }

    const bulkOps = subjectsToCreate.map((subject: any) => ({
      insertOne: { document: subject },
    }));

    const createdSubjects = await Subject.bulkWrite(bulkOps);

    return res.status(201).json({
      message: "Subjects created successfully",
      subjects: createdSubjects.insertedIds,
      showMessage: true,
    });
  }
);

export const getAllSubjects = asyncTransactionWrapper(
  async (req: Request, res: Response) => {
    const subjects = await Subject.find({
      school: req.user.profile.school,
      status: 1,
    }).lean();

    return res
      .status(200)
      .json({ subjects, message: "Subjects fetched successfully" });
  }
);

export const getAllSubjectsWithClassroomCount = asyncTransactionWrapper(
  async (req: Request, res: Response) => {
    const {
      page = 1,
      limit = 10,
      sf = "name",
      so = "asc",
      search = "",
    } = req.query;
    const sortOrder = so === "asc" ? 1 : -1;

    const match: any = {
      school: req.user.profile.school,
      // status: 1,
    };

    if (search) {
      match.name = { $regex: search, $options: "i" };
    }

    const subjects = await Subject.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "classroomsubjectassociations",
          localField: "_id",
          foreignField: "subject",
          as: "classrooms",
        },
      },
      {
        $addFields: {
          classroomCount: { $size: "$classrooms" },
        },
      },
      {
        $sort: { [sf.toString()]: sortOrder },
      },
      {
        $skip: (Number(page) - 1) * Number(limit),
      },
      {
        $limit: Number(limit),
      },
    ]);

    const totalSubjects = await Subject.countDocuments(match);

    return res.status(200).json({
      subjects,
      totalSubjects,
      page: Number(page),
      totalPages: Math.ceil(totalSubjects / Number(limit)),
    });
  }
);

export const updateSubject = asyncTransactionWrapper(
  async (req: Request, res: Response) => {
    const { subjectId } = req.params;

    const validatedData = validate(updateSubjectSchema, req.body);
    if (!validatedData) return;

    const updatedSubject = await Subject.findOneAndUpdate(
      { _id: subjectId, school: req.user.profile.school },
      {
        $set: validatedData,
      },
      { new: true }
    );

    if (!updatedSubject) {
      throw new CustomError("Subject not found", 404);
    }

    return res.status(200).json({
      message: "Subject updated successfully",
      subject: updatedSubject,
      showMessage: true,
    });
  }
);

export const disableSubject = asyncTransactionWrapper(
  async (req: Request, res: Response, session: ClientSession) => {
    const validatedData = validate(enableDisableSubjectSchema, req.body, res);
    if (!validatedData) return;

    const { subjects } = validatedData;

    const updatedSubjects = await Subject.updateMany(
      { _id: { $in: subjects }, school: req.user.profile.school },
      { status: 0 },
      { new: true, session }
    );

    if (updatedSubjects.modifiedCount === 0) {
      throw new CustomError("No subjects found or updated", 404);
    }

    return res.status(200).json({
      message: "Subjects disabled successfully",
      showMessage: true,
    });
  }
);

export const enableSubject = asyncTransactionWrapper(
  async (req: Request, res: Response, session: ClientSession) => {
    const validatedData = validate(enableDisableSubjectSchema, req.body, res);
    if (!validatedData) return;

    const { subjects } = validatedData;

    const updatedSubjects = await Subject.updateMany(
      { _id: { $in: subjects }, school: req.user.profile.school },
      { status: 1 },
      { new: true, session }
    );

    if (updatedSubjects.modifiedCount === 0) {
      throw new CustomError("No subjects found or updated", 404);
    }

    return res.status(200).json({
      message: "Subjects enabled successfully",
      showMessage: true,
    });
  }
);
