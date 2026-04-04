import { Router } from "express";
import {
    listCourses,
    showAddCoursePage,
    postAddCourse,
    showEditCoursePage,
    postEditCourse,
    deleteCourse,
    showAddSessionsPage,
    postAddSession,
    deleteSession,
    getClassList,
} from "../../controllers/adminCoursesController.js";

const router = Router();

router.get("/", listCourses);
router.get("/new", showAddCoursePage);
router.post("/", postAddCourse);
router.get("/:id/sessions/new", showAddSessionsPage);
router.get("/:id/sessions", showAddSessionsPage);
router.post("/:id/sessions", postAddSession);
router.post("/:id/sessions/:sessionId/delete", deleteSession);
router.get("/:id/class-list", getClassList);
router.get("/:id/edit", showEditCoursePage);
router.post("/:id/edit", postEditCourse);
router.post("/:id/delete", deleteCourse);

export default router;
