// services/bookingService.js
import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { BookingModel } from "../models/bookingModel.js";

export async function bookCourseForUser(userId, courseId) {
  const course = await CourseModel.findById(courseId);

  if (!course)
    throw new Error("Course not found");

  const userBooking = await BookingModel.findByUserAndCourse(userId, courseId);
  if (userBooking) {
    throw new Error("User already booked this course");
  }

  const sessions = await SessionModel.listByCourse(courseId);

  if (sessions.length === 0)
    throw new Error("Course has no sessions");

  for (const s of sessions) {
    await SessionModel.incrementBookedCount(s._id);
  }

  return BookingModel.create({
    userId,
    courseId,
    type: "COURSE",
    sessionIds: sessions.map((s) => s._id),
    status: "CONFIRMED",
  });
}

export async function bookSessionForUser(userId, sessionId) {
  const session = await SessionModel.findById(sessionId);
  if (!session)
    throw new Error("Session not found");

  const userBooking = await BookingModel.findByUserAndCourse(userId, session.courseId);
  if (userBooking) {
    throw new Error("User already booked this session");
  }

  const course = await CourseModel.findById(session.courseId);
  if (!course)
    throw new Error("Course not found");

  if (!course.allowDropIn && course.type === "WEEKLY_BLOCK") {
    throw new Error("Drop-in not allowed for this course");
  }

  await SessionModel.incrementBookedCount(sessionId);

  return BookingModel.create({
    userId,
    courseId: course._id,
    type: "SESSION",
    sessionIds: [sessionId],
    status: "CONFIRMED",
  });
}

export async function getBookingById(bookingId) {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) {
    throw new Error("Booking not found");
  }
  return booking;
}
