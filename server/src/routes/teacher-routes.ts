import { Router } from "express";
import { authenticateUser } from "../middlewares/auth-middleware";
import { requireRole } from "../middlewares/role-middleware";
import {
  createBulkTeachers,
  createTeacher,
  getAllTeachers,
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

export default router;
