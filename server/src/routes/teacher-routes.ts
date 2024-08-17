import { Router } from "express";
import { authenticateUser } from "../middlewares/auth-middleware";
import { requireRole } from "../middlewares/role-middleware";
import { getAllTeachers } from "../controllers/teacher-controller";

const router = Router();

router.use(authenticateUser);

router.get("/get/all/teachers", requireRole(["principal"]), getAllTeachers);

export default router;
