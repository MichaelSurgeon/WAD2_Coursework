import { Router } from "express";
import { adminDashboard } from "../../controllers/adminController.js";

const router = Router();

router.get("/", adminDashboard);

export default router;
