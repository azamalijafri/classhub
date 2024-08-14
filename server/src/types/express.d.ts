import { IUser } from "../models/user";
import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    user: IUser;
  }
}
