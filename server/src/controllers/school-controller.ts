import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import User from "../models/user";
import { registerSchema } from "../validation/school-schema";
import Principal from "../models/principal";
import School from "../models/school";
import { validate } from "../libs/utils";
import { asyncTransactionWrapper } from "../libs/async-transaction-wrapper";

export const registerPrincipal = asyncTransactionWrapper(
  async (req: Request, res: Response, session) => {
    const validatedData = validate(registerSchema, req.body, res);
    if (!validatedData) return;

    const { schoolName, principalName, email, password, code } = validatedData;

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    const sanitizedSchoolCode = code.replace(/[^a-z0-9]/g, "").toLowerCase();

    const school = new School({
      name: schoolName,
      code: sanitizedSchoolCode,
    });

    await school.save({ session });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role: "principal",
    });

    await user.save({ session });

    await Principal.create(
      [{ name: principalName, user: user._id, school: school._id }],
      { session }
    );

    res.status(201).json({
      showMessage: true,
      message: "Principal and school registered successfully",
    });
  }
);
