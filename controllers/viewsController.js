import { CourseService } from "../services/courseService.js";
import { SessionService } from "../services/sessionService.js";
import {
  bookCourseForUser,
  bookSessionForUser,
  getBookingById,
} from "../services/bookingService.js";
import { fmtDate } from "../utils/dateFormatter.js";
import {
  formatCourseDetail,
  formatBookingForConfirmation,
} from "../helpers/dataTransformers.js";

export const homePage = async (req, res, next) => {
  try {
    const courses = await CourseService.getAllCourses();
    res.render("pages/home", {
      title: "Yoga Courses",
      user: req.user,
      courses,
    });
  } catch (err) {
    next(err);
  }
};

export const courseDetailPage = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const courseData = await CourseService.getCourseById(courseId);

    if (!courseData) {
      return res
        .status(404)
        .render("pages/error", { title: "Not found", message: "Course not found" });
    }

    const { course, sessions } = formatCourseDetail(courseData);

    res.render("pages/course", {
      title: courseData.title,
      user: req.user,
      course,
      sessions,
    });
  } catch (err) {
    next(err);
  }
};

export const getBookCourseForm = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const courseData = await CourseService.getCourseById(courseId);

    if (!courseData) {
      return res
        .status(404)
        .render("pages/error", { title: "Not found", message: "Course not found" });
    }

    const { course } = formatCourseDetail(courseData);

    res.render("pages/course-book", {
      title: `Book: ${course.title}`,
      user: req.user,
      course,
    });
  } catch (err) {
    next(err);
  }
};

export const postBookCourse = async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const booking = await bookCourseForUser(req.user._id, courseId);
    res.redirect(`/bookings/${booking._id}?status=${booking.status}`);
  } catch (err) {
    next(err);
  }
};

export const getBookSessionForm = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const session = await SessionService.getSessionById(sessionId);

    if (!session) {
      return res
        .status(404)
        .render("pages/error", { title: "Not found", message: "Session not found" });
    }

    res.render("pages/session-book", {
      title: `Book Session`,
      user: req.user,
      session,
    });
  } catch (err) {
    next(err);
  }
};

export const postBookSession = async (req, res, next) => {
  try {
    const sessionId = req.params.id;
    const booking = await bookSessionForUser(req.user._id, sessionId);
    res.redirect(`/bookings/${booking._id}?status=${booking.status}`);
  } catch (err) {
    next(err);
  }
};

export const bookingConfirmationPage = async (req, res, next) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await getBookingById(bookingId);

    res.render("pages/booking-confirmation", {
      title: "Booking confirmation",
      user: req.user,
      booking: {
        ...formatBookingForConfirmation(booking, fmtDate),
        status: req.query.status || booking.status,
      },
    });
  } catch (err) {
    next(err);
  }
};
