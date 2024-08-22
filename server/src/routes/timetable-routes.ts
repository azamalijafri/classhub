import {
  getTimetable,
  updateTimetable,
} from "./../controllers/timetable-controller";
import { Router } from "express";
import { authenticateUser } from "../middlewares/auth-middleware";
import { requireRole } from "../middlewares/role-middleware";

const router = Router();

router.use(authenticateUser);

router.post(
  "/update/timetable",
  requireRole(["principal", "teacher"]),
  updateTimetable
);

router.get("/get/timetable/:classId", getTimetable);
export default router;
