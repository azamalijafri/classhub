import { Router } from "express";
import { authenticateUser } from "../middlewares/auth-middleware";
import { requireRole } from "../middlewares/role-middleware";
import { markAttendance } from "../controllers/attendance-controller";

const router = Router();

router.use(authenticateUser);

router.post(
  "/mark/attendance",
  requireRole(["teacher", "principal"]),
  markAttendance
);

export default router;
