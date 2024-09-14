import { Router } from "express";
import { getMyProfile } from "../controllers/profile-controller";
import { authenticateUser } from "../middlewares/auth-middleware";

const router = Router();

router.use(authenticateUser);

router.get("/get/my/profile", getMyProfile);

export default router;
