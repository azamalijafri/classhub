import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userSchema } from "../validation/user-schema";
import { validate } from "../libs/utils";
import { asyncTransactionWrapper } from "../libs/async-transaction-wrapper";
import { CustomError } from "../libs/custom-error";

export const login = asyncTransactionWrapper(
  async (req: Request, res: Response) => {
    const { email, password } = validate(userSchema, req.body, res);

    const user = await User.findOne({ email });
    if (!user || !(await user?.comparePassword(password))) {
      throw new CustomError("Invalid Credentials", 401);
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    return res.json({ token, user });
  }
);
