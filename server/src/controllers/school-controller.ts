import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import User from "../models/user";
import { registerSchema } from "../validation/school-schema";
import Principal from "../models/principal";
import School from "../models/school";
import { z } from "zod";
import { Types } from "mongoose";
import { validate } from "../libs/utils";

export const registerPrincipal = async (req: Request, res: Response) => {
  try {
    const validatedData = validate(registerSchema, req.body, res);

    if (!validatedData) return;

    const { schoolName, principalName, email, password, schoolCode } =
      validatedData;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashedPassword,
      role: "principal",
    });

    const principal = await Principal.create({
      name: principalName,
      user: user._id,
    });

    const school = await School.create({
      name: schoolName,
      principal: principal._id,
      schoolCode: schoolCode?.toLowerCase(),
    });

    principal.school = school._id as Types.ObjectId;
    await principal.save();

    res.status(201).json({
      showMessage: true,
      message: "Principal and school registered successfully",
      principal: {
        id: principal._id,
        name: principal.name,
        email: user.email,
      },
      school: {
        id: school._id,
        name: school.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: error.errors.map((e) => e.message) });
    }

    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred during registration." });
  }
};
