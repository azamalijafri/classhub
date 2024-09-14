import { Router } from "express";
import { authenticateUser } from "../middlewares/auth-middleware";
import { requireRole } from "../middlewares/role-middleware";
import {
  createSubjects,
  getAllSubjects,
} from "../controllers/subject-controller";

const router = Router();

router.use(authenticateUser);

router.post("/create/subjects", requireRole(["principal"]), createSubjects);

router.get("/get/all/subjects", requireRole(["principal"]), getAllSubjects);

export default router;
