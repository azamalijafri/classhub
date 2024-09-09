import { Router } from "express";
import { authenticateUser } from "../middlewares/auth-middleware";
import { requireRole } from "../middlewares/role-middleware";
import { getAllStudent } from "../controllers/student-controller";

const router = Router();

router.use(authenticateUser);

router.get(
  "/get/all/students",
  requireRole(["principal"]),
  getAllStudent
);

export default router;
