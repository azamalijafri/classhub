import { Router } from "express";
import { authenticateUser } from "../middlewares/auth-middleware";
import { requireRole } from "../middlewares/role-middleware";
import {
  assignStudentToClassroom,
  assignTeacherToClassroom,
  createClassroom,
  getAllClassrooms,
  getClassroomDetails,
} from "../controllers/classroom-controller";

const router = Router();

router.use(authenticateUser);

router.post("/create/classroom", requireRole(["principal"]), createClassroom);

router.post(
  "/assign/teacher",
  requireRole(["principal"]),
  assignTeacherToClassroom
);

router.post(
  "/assign/student",
  requireRole(["principal", "teacher"]),
  assignStudentToClassroom
);

router.get("/get/all/classrooms", requireRole(["principal"]), getAllClassrooms);

router.get("/get/classroom/details/:classId", getClassroomDetails);

export default router;
