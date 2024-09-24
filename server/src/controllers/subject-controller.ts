import { Request, Response } from "express";
import { createSubjectsSchema } from "../validation/subject-schema";
import Subject, { ISubject } from "../models/subject";
import { validate } from "../libs/utils";

export const createSubjects = async (req: Request, res: Response) => {
  try {
    const validatedData = validate(createSubjectsSchema, req.body, res);

    if (!validatedData) return;

    const { subjects } = validatedData;

    const existingSubjects = await Subject.find({
      name: { $in: subjects.map((subject: ISubject) => subject.name) },
      school: req.user.profile.school,
    });

    const existingSubjectNames = existingSubjects.map(
      (subject) => subject.name
    );

    const subjectsToCreate = subjects
      .filter(
        (subject: ISubject) => !existingSubjectNames.includes(subject.name)
      )
      .map((subject: ISubject) => ({
        ...subject,
        school: req.user.profile.school,
      }));

    if (subjectsToCreate.length === 0) {
      return res.status(200).json({
        message: "No new subjects to create. All subjects already exist.",
        showMessage: true,
      });
    }

    const createdSubjects = await Subject.insertMany(subjectsToCreate);

    return res.status(201).json({
      message: "Subjects created successfully",
      subjects: createdSubjects,
      showMessage: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error creating subjects",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAllSubjects = async (req: Request, res: Response) => {
  try {
    const subjects = await Subject.find({
      school: req.user.profile.school,
      status: 1,
    });

    return res
      .status(200)
      .json({ subjects, message: "Subjects fetched successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error fetching subjects",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
