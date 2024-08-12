import { Request, Response } from "express";
import User, { IUser } from "../models/user";
import bcrypt from "bcryptjs";
import { userSchema } from "../validation/user-schema";

const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const createUser = async (
  email: string,
  password: string,
  role: IUser["role"],
  res: Response
) => {
  try {
    const result = userSchema.safeParse({ email, password });

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.errors[0].path,
      });
    }

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
    return res.status(201).json({
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } created successfully`,
      user: user,
    });
  } catch (error) {
    return res.status(500).json({ message: `Error creating ${role}`, error });
  }
};

export const createTeacher = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  await createUser(email, password, "teacher", res);
};

export const createStudent = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  await createUser(email, password, "student", res);
};
