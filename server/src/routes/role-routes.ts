import { Router } from "express";
import { createTeacher, createStudent } from "../controllers/role-controller";
import { authenticateUser } from "../middlewares/auth-middleware";
import { requireRole } from "../middlewares/role-middleware";

const router = Router();

router.use(authenticateUser);

router.post("/create-teacher", requireRole(["principal"]), createTeacher);

router.post(
  "/create-student",
  requireRole(["principal", "teacher"]),
  createStudent
);

export default router;
