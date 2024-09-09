import { IPrincipal } from "../models/principal";
import { IStudent } from "../models/student";
import { ITeacher } from "../models/teacher";
import { IUser } from "../models/user";
import "express-serve-static-core";

declare module "express-serve-static-core" {
  interface Request {
    user: IUser & { profile: IPrincipal | ITeacher | IStudent };
  }
}
