import { Request, Response } from "express";
import { createSubjectsSchema } from "../validation/subject-schema";
import Subject, { ISubject } from "../models/subject";
import { validate } from "../libs/utils";
import { asyncTransactionWrapper } from "../libs/async-transaction-wrapper";

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
