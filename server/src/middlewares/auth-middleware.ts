import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";

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

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Failed to authenticate token" });
  }
};
