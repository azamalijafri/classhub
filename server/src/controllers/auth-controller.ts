import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userSchema } from "../validation/user-schema";
import { validate } from "../libs/utils";
import { asyncTransactionWrapper } from "../libs/async-transaction-wrapper";

export const login = asyncTransactionWrapper(
  async (req: Request, res: Response) => {
    const { email, password } = validate(userSchema, req.body, res);

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  }
);
