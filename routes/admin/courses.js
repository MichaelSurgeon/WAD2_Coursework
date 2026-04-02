import { Router } from "express";
import {
    listCourses,
    showAddCoursePage,
    postAddCourse,
    showEditCoursePage,
    postEditCourse,
    deleteCourse,
} from "../../controllers/adminController.js";

const router = Router();

router.get("/", listCourses);
router.get("/new", showAddCoursePage);
router.post("/", postAddCourse);
router.get("/:id/edit", showEditCoursePage);
router.post("/:id/edit", postEditCourse);
router.post("/:id/delete", deleteCourse);

export default router;
