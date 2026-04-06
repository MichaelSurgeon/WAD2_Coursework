import { Router } from "express";
import { verifyOrganiser } from "../../middlewares/auth.js";
import dashboardRoutes from "./dashboard.js";
import coursesRoutes from "./courses.js";
import usersRoutes from "./users.js";

const router = Router();

router.use(verifyOrganiser);

router.use("/", dashboardRoutes);
router.use("/courses", coursesRoutes);
router.use("/users", usersRoutes);

export default router;
