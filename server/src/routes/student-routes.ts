import { Router } from "express";
import { authenticateUser } from "../middlewares/auth-middleware";
import { requireRole } from "../middlewares/role-middleware";
import {
  getAllStudent,
  getAllStudentByClass,
} from "../controllers/student-controller";

const router = Router();

router.use(authenticateUser);

router.get("/get/all/students", requireRole(["principal"]), getAllStudent);

router.get(
  "/get/students/:classroomId",
  requireRole(["principal", "student", "teacher"]),
  getAllStudentByClass
);

export default router;
