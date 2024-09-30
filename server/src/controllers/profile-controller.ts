import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import Student from "../models/student";
import Teacher from "../models/teacher";
import Principal from "../models/principal";
import passwordGenerator from "generate-password";
import { ISchool } from "../models/school";
import {
  delay,
  generateUniqueEmail,
  hashPassword,
  sendEmail,
} from "../libs/utils";
import { ClientSession, Types } from "mongoose";
import ClassroomStudentAssociation from "../models/classroom-student";
import { asyncTransactionWrapper } from "../libs/async-transaction-wrapper";
import { CustomError } from "../libs/custom-error";

interface CreateUserAndProfileProps {
  name: string;
  email: string;
  role: IUser["role"];
  school: ISchool;
  roll?: string;
  subject?: string;
  classroom?: string;
  session: ClientSession;
}

export const createUserAndProfile = async ({
  name,
  email,
  role,
  school,
  roll,
  subject,
  classroom,
  session,
}: CreateUserAndProfileProps) => {
  const password = passwordGenerator.generate({ length: 6, numbers: true });
  const emailName = name.replace(/\s+/g, "").toLowerCase();
  const sanitizedRoll = roll?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
  const userSchoolEmail = roll
    ? `${emailName}.${sanitizedRoll}@${school.code}.edu.com`
    : `${emailName}@${school.code}.edu.com`;

  const uniqueEmail = await generateUniqueEmail(userSchoolEmail);

  const user = new User({
    email: uniqueEmail,
    password,
    role,
  });

  await user.save({ session });

  let profile;

  if (role === "student") {
    profile = new Student({ user: user._id, name, school: school._id, roll });
  } else if (role === "teacher") {
    profile = new Teacher({
      user: user._id,
      name,
      school: school._id,
      subject,
    });
  }

  if (profile) {
    await profile.save({ session });

    if (classroom) {
      await ClassroomStudentAssociation.create(
        [{ classroom, student: profile._id }],
        { session }
      );
    }
  }

  return { email, uniqueEmail, password };
};

export const getMyProfile = asyncTransactionWrapper(
  async (req: Request, res: Response) => {
    const { role } = req.query;
    let profile;

    const roleModels: { [key: string]: any } = {
      student: Student,
      teacher: Teacher,
      principal: Principal,
    };

    const ProfileModel = roleModels[role as string];
    if (!ProfileModel) {
      throw new CustomError("Invalid role type", 400);
    }

    profile = await ProfileModel.findOne({ user: req.user?._id, status: 1 });

    if (!profile) {
      throw new CustomError("Profile not found", 404);
    }

    res.json({ profile, user: req.user });
  }
);
