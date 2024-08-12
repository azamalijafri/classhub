import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { userSchema } from "../validation/user-schema";

export const login = async (req: Request, res: Response) => {
  const result = userSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: result.error.errors[0].path,
    });
  }

  const { email, password } = result.data;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
