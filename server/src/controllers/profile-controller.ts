import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import Student from "../models/student";
import Teacher from "../models/teacher";
import Principal from "../models/principal";
import passwordGenerator from "generate-password";
import { ISchool } from "../models/school";
import { generateUniqueEmail, hashPassword, sendEmail } from "../libs/utils";
import { ClientSession, startSession } from "mongoose";
import ClassroomStudentAssociation from "../models/classroom-student";

interface CreateUserAndProfileProps {
  name: string;
  email: string;
  role: IUser["role"];
  res: Response;
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
  res,
  school,
  roll,
  subject,
  classroom,
  session,
}: CreateUserAndProfileProps) => {
  try {
    const password = passwordGenerator.generate({ length: 6, numbers: true });
    const emailName = name.replace(/\s+/g, "").toLowerCase();
    const sanitizedRoll = roll?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
    const userSchoolEmail = roll
      ? `${emailName}.${sanitizedRoll}@${school.code}.edu.com`
      : `${emailName}@${school.code}.edu.com`;

    const uniqueEmail = await generateUniqueEmail(userSchoolEmail);
    const hashedPassword = await hashPassword(password);

    const user = new User({
      email: uniqueEmail,
      password: hashedPassword,
      role,
    });
    await user.save({ session });

    let profile;

    if (role === "student") {
      profile = new Student({ user: user._id, name, school: school._id, roll });
      await ClassroomStudentAssociation.create(
        [{ classroom, student: profile._id }],
        { session }
      );
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
    }

    await sendEmail(email, uniqueEmail, password);
    await session.commitTransaction();
    res.status(201).json({
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } created successfully`,
      email: uniqueEmail,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error(`Error creating ${role}:`, error);
    return res.status(500).json({ message: `Error creating ${role}` });
  } finally {
    await session.endSession();
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    let profile;

    const roleModels: { [key: string]: any } = {
      student: Student,
      teacher: Teacher,
      principal: Principal,
    };

    const ProfileModel = roleModels[role as string];
    if (!ProfileModel) {
      return res.status(400).json({ message: "Invalid role type" });
    }

    profile = await ProfileModel.findOne({ user: req.user?._id, status: 1 });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found or removed" });
    }

    res.json({ profile, user: req.user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};
