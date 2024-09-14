import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user";
import Principal, { IPrincipal } from "../models/principal";
import Teacher, { ITeacher } from "../models/teacher";
import Student, { IStudent } from "../models/student";
import { log } from "console";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

    const user: (IUser & { profile: IPrincipal | ITeacher | IStudent }) | null =
      await User.findById(decoded.id).lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    let profile;

    switch (user.role) {
      case "principal":
        profile = await Principal.findOne({ user: user._id });
        break;
      case "teacher":
        profile = await Teacher.findOne({ user: user._id });
        break;
      case "student":
        profile = await Student.findOne({ user: user._id });
        break;
    }

    if (!profile) {
      return res.status(404).json({ message: "User Profile Not Found" });
    }

    user.profile = profile;

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ message: "Failed to authenticate token" });
  }
};
