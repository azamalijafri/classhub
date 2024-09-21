import { Router } from "express";
import { authenticateUser } from "../middlewares/auth-middleware";
import { requireRole } from "../middlewares/role-middleware";
import {
  createBulkTeachers,
  createTeacher,
  getAllTeachers,
  getMyClassroom,
  getMySchedule,
  removeTeacherFromSchool,
  updateTeacher,
} from "../controllers/teacher-controller";

const router = Router();

router.use(authenticateUser);

router.get("/get/all/teachers", requireRole(["principal"]), getAllTeachers);

router.post("/create/teacher", requireRole(["principal"]), createTeacher);

router.post(
  "/create/bulk/teachers",
  requireRole(["principal"]),
  createBulkTeachers
);

router.put(
  "/update/teacher/:teacherId",
  requireRole(["principal"]),
  updateTeacher
);

router.put(
  "/remove/teacher/:teacherId",
  requireRole(["principal"]),
  removeTeacherFromSchool
);

router.get(
  "/teacher/get/my/classroom/",
  requireRole(["teacher"]),
  getMyClassroom
);

router.get("/get/my/schedule/", requireRole(["teacher"]), getMySchedule);

export default router;
