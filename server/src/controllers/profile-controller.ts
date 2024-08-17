import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import bcrypt from "bcryptjs";
import Student from "../models/student";
import Teacher from "../models/teacher";
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";
import Principal from "../models/principal";
import { Types } from "mongoose";

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const createUserAndProfile = async (
  name: string,
  email: string,
  password: string,
  role: IUser["role"],
  res: Response
) => {
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const user = new User({
      email,
      password: hashedPassword,
      role,
    });

    await user.save();

    const randomName = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
    });

    let profile;
    if (role === "student") {
      profile = new Student({ user: user._id, name: name });
    } else if (role === "teacher") {
      profile = new Teacher({ user: user._id, name: name });
    }

    if (profile) {
      await profile.save();
    }

    return res.status(201).json({
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } created successfully`,
      user,
      profile,
    });
  } catch (error) {
    return res.status(500).json({ message: `Error creating ${role}`, error });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  await createUserAndProfile(name, email, password, "teacher", res);
};

export const createStudent = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  await createUserAndProfile(name, email, password, "student", res);
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const { role } = req.query;

    let profile;

    switch (role) {
      case "student": {
        profile = await Student.findOne({ user: req.user?._id });
        break;
      }
      case "teacher": {
        profile = await Teacher.findOne({ user: req.user?._id });
        break;
      }
      case "principal": {
        profile = await Principal.findOne({ user: req.user?._id });
        break;
      }
      default: {
        return res.status(400).json({ message: "invalid role type" });
      }
    }

    if (!profile) return res.status(404).json({ message: "profile not found" });

    res.json({ profile, user: req.user });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
