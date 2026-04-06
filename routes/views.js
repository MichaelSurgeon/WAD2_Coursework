import { Router } from "express";
import {
  homePage,
  courseDetailPage,
  postBookCourse,
  postBookSession,
  bookingConfirmationPage,
} from "../controllers/viewsController.js";

import { coursesListPage } from "../controllers/coursesListController.js";
import { loginPage, loginHandler, registerPage, registerHandler, logout, logoutConfirmationPage } from "../controllers/authController.js";
import { verifyUser } from "../middlewares/auth.js";

const router = Router();

// Auth routes
router.get("/login", loginPage);
router.post("/login", loginHandler);
router.get("/register", registerPage);
router.post("/register", registerHandler);
router.get("/logout", logoutConfirmationPage);
router.post("/logout", logout);

// Public routes for no auth
router.get("/", homePage);
router.get("/courses", coursesListPage);
router.get("/courses/:id", courseDetailPage);

// Protected routes (require login)
router.post("/courses/:id/book", verifyUser, postBookCourse);
router.post("/sessions/:id/book", verifyUser, postBookSession);
router.get("/bookings/:bookingId", verifyUser, bookingConfirmationPage);

export default router;
