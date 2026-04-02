// routes/views.js
import { Router } from "express";
import {
  homePage,
  courseDetailPage,
  getBookCourseForm,
  postBookCourse,
  getBookSessionForm,
  postBookSession,
  bookingConfirmationPage,
} from "../controllers/viewsController.js";

import { coursesListPage } from "../controllers/coursesListController.js";
import { loginPage, loginHandler, registerPage, registerHandler, logout } from "../controllers/authController.js";
import { verify } from "../middlewares/auth.js";

const router = Router();

// Auth routes
router.get("/login", loginPage);
router.post("/login", loginHandler);
router.get("/register", registerPage);
router.post("/register", registerHandler);
router.get("/logout", logout);

// Public routes
router.get("/", homePage);
router.get("/courses", coursesListPage);
router.get("/courses/:id", courseDetailPage);

// Protected routes (require login)
router.get("/courses/:id/book", verify, getBookCourseForm);
router.post("/courses/:id/book", verify, postBookCourse);
router.get("/sessions/:id/book", verify, getBookSessionForm);
router.post("/sessions/:id/book", verify, postBookSession);
router.get("/bookings/:bookingId", verify, bookingConfirmationPage);

export default router;
