import { Router } from "express";
import { verifyOrganiser } from "../../middlewares/auth.js";
import dashboardRoutes from "./dashboard.js";
import coursesRoutes from "./courses.js";
import usersRoutes from "./users.js";

const router = Router();

// All admin routes require organiser role
router.use(verifyOrganiser);

// Sub-routes
router.use("/", dashboardRoutes);
router.use("/courses", coursesRoutes);
router.use("/users", usersRoutes);

export default router;
