import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import Student from "../models/student";
import Teacher from "../models/teacher";
import Principal from "../models/principal";
import passwordGenerator from "generate-password";
import { ISchool } from "../models/school";
import { generateUniqueEmail, hashPassword, sendEmail } from "../libs/utils";

interface CreateUserAndProfileProps {
  name: string;
  email: string;
  role: IUser["role"];
  res: Response;
  school: ISchool;
  roll?: string;
  subject?: string;
}

export const createUserAndProfile = async ({
  name,
  email,
  role,
  res,
  school,
  roll,
  subject,
}: CreateUserAndProfileProps) => {
  try {
    const password = passwordGenerator.generate({
      length: 6,
      numbers: true,
    });

    const emailName = name.replace(/\s+/g, "").toLowerCase();
    let userSchoolEmail;

    if (roll) {
      userSchoolEmail = `${emailName}.${roll.toLowerCase()}@${
        school.schoolCode
      }.edu.com`;
    } else {
      userSchoolEmail = `${emailName}@${school.schoolCode}.edu.com`;
    }

    const uniqueEmail = await generateUniqueEmail(userSchoolEmail);
    const hashedPassword = await hashPassword(password);

    const user = new User({
      email: uniqueEmail,
      password: hashedPassword,
      role,
    });

    await user.save();

    let profile;
    if (role === "student") {
      profile = new Student({
        user: user._id,
        name,
        school: school._id,
        rollNo: roll,
      });
    } else if (role === "teacher") {
      profile = new Teacher({
        user: user._id,
        name,
        school: school._id,
        subject,
      });
    }

    if (profile) {
      await profile.save();
    }

    await sendEmail(email, uniqueEmail, password);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `Error creating ${role}`, error });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    let profile;

    switch (role) {
      case "student":
        profile = await Student.findOne({ user: req.user?._id });
        break;
      case "teacher":
        profile = await Teacher.findOne({ user: req.user?._id });
        break;
      case "principal":
        profile = await Principal.findOne({ user: req.user?._id });
        break;
      default:
        return res.status(400).json({ message: "Invalid role type" });
    }

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ profile, user: req.user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
};
