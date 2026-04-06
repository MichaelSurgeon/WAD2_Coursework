import { Router } from "express";
import {
    listCourses,
    showAddCoursePage,
    postAddCourse,
    showEditCoursePage,
    postEditCourse,
    deleteCourse,
    showSessionsPage,
    postAddSession,
    showEditSessionPage,
    postEditSession,
    deleteSession,
    getClassList,
} from "../../controllers/adminCoursesController.js";

const router = Router();

router.get("/", listCourses);
router.get("/new", showAddCoursePage);
router.post("/", postAddCourse);
router.get("/:id/sessions", showSessionsPage);
router.post("/:id/sessions", postAddSession);
router.get("/:id/sessions/:sessionId/edit", showEditSessionPage);
router.post("/:id/sessions/:sessionId/edit", postEditSession);
router.post("/:id/sessions/:sessionId/delete", deleteSession);
router.get("/:id/class-list", getClassList);
router.get("/:id/edit", showEditCoursePage);
router.post("/:id/edit", postEditCourse);
router.post("/:id/delete", deleteCourse);

export default router;
