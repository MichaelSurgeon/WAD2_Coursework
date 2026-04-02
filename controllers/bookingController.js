// controllers/bookingController.js
import {
  bookCourseForUser,
  bookSessionForUser,
  cancelBooking as cancelBookingService,
} from "../services/bookingService.js";

export const bookCourse = async (req, res, next) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;
    const booking = await bookCourseForUser(userId, courseId);
    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
};

export const bookSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user._id;
    const booking = await bookSessionForUser(userId, sessionId);
    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user._id;
    const updated = await cancelBookingService(bookingId, userId);
    res.json({ booking: updated });
  } catch (err) {
    next(err);
  }
};
