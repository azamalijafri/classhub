import { Router } from "express";
import { authenticateUser } from "../middlewares/auth-middleware";
import { requireRole } from "../middlewares/role-middleware";
import {
  assignStudentsToClassroom,
  assignTeacherToClassroom,
  createClassroom,
  deleteClassroom,
  getAllClassrooms,
  getClassroomAttendance,
  getClassroomDetails,
  getClassroomSubjects,
  updateClassroom,
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
  "/assign/students",
  requireRole(["principal"]),
  assignStudentsToClassroom
);

router.get("/get/all/classrooms", requireRole(["principal"]), getAllClassrooms);

router.get("/get/classroom/subjects/:classroomId", getClassroomSubjects);

router.get("/get/classroom/details/:classroomId", getClassroomDetails);

router.delete("/remove/classroom/:classroomId", deleteClassroom);

router.put("/update/classroom/:classroomId", updateClassroom);

router.get("/get/classroom/attendance/:classroomId", getClassroomAttendance);

export default router;
