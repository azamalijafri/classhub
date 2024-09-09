import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/user";
import Principal from "../models/principal";
import Teacher from "../models/teacher";
import Student from "../models/student";

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

    const user: (IUser & { profile: any }) | null = await User.findById(
      decoded.id
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    let userProfile;

    switch (user.role) {
      case "principal":
        userProfile = await Principal.findOne({ user: user._id });
        break;
      case "teacher":
        userProfile = await Teacher.findOne({ user: user._id });
        break;
      case "student":
        userProfile = await Student.findOne({ user: user._id });
        break;
    }

    if (!userProfile) {
      return res.status(404).json({ message: "User Profile Not Found" });
    }

    user.profile = userProfile;
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ message: "Failed to authenticate token" });
  }
};
