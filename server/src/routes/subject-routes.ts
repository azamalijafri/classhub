import { Router } from "express";
import { authenticateUser } from "../middlewares/auth-middleware";
import { requireRole } from "../middlewares/role-middleware";
import {
  createSubjects,
  disableSubject,
  enableSubject,
  getAllSubjects,
  getAllSubjectsWithClassroomCount,
  updateSubject,
} from "../controllers/subject-controller";

const router = Router();

router.use(authenticateUser);

router.post("/create/subjects", requireRole(["principal"]), createSubjects);

router.get("/get/all/subjects", requireRole(["principal"]), getAllSubjects);

router.get(
  "/get/all/subjects/with/classroom/count",
  requireRole(["principal"]),
  getAllSubjectsWithClassroomCount
);

router.put(
  "/update/subject/:subjectId",
  requireRole(["principal"]),
  updateSubject
);

router.put(
  "/enable/subject/:subjectId",
  requireRole(["principal"]),
  enableSubject
);

router.put(
  "/disable/subject/:subjectId",
  requireRole(["principal"]),
  disableSubject
);
export default router;
