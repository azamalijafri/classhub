import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import User from "../models/user";
import { registerSchema } from "../validation/school-schema";
import Principal from "../models/principal";
import School from "../models/school";
import { validate } from "../libs/utils";
import { asyncTransactionWrapper } from "../libs/async-transaction-wrapper";
import { CustomError } from "../libs/custom-error";

export const registerPrincipal = asyncTransactionWrapper(
  async (req: Request, res: Response, session) => {
    const validatedData = validate(registerSchema, req.body, res);
    if (!validatedData) return;

    const { schoolName, principalName, email, password, code } = validatedData;

    const existingCode = await School.findOne({ code }).session(session);

    if (existingCode) {
      throw new CustomError("This school code has already been taken", 409);
    }

    const existingUser = await User.findOne({ email }).session(session);

    if (existingUser) {
      throw new CustomError("Email already in use", 409);
    }

    const sanitizedSchoolCode = code.replace(/[^a-z0-9]/g, "").toLowerCase();

    const school = new School({
      name: schoolName,
      code: sanitizedSchoolCode,
    });

    await school.save({ session });

    const user = new User({
      email,
      password,
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
