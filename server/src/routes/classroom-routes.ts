import { Router } from "express";
import { authenticateUser } from "../middlewares/auth-middleware";
import { requireRole } from "../middlewares/role-middleware";
import {
  assignTeacherToClassroom,
  createClassroom,
} from "../controllers/classroom-controller";

const router = Router();

router.use(authenticateUser);

router.post("/create-classroom", requireRole(["principal"]), createClassroom);

router.post(
  "/assign-teacher",
  requireRole(["principal"]),
  assignTeacherToClassroom
);

export default router;
