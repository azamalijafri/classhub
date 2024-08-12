import { Request, Response, NextFunction } from "express";
import { IUser } from "../models/user";

export const requireRole = (roles: Array<IUser["role"]>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    if (!roles.includes(user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }
    next();
  };
};
