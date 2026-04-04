// services/bookingService.js
import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { BookingModel } from "../models/bookingModel.js";

export async function bookCourseForUser(userId, courseId) {
  const course = await CourseModel.findById(courseId);
  if (!course) throw new Error("Course not found");
  const sessions = await SessionModel.listByCourse(courseId);
  if (sessions.length === 0) throw new Error("Course has no sessions");

  let status = "CONFIRMED";
  const failedSessions = [];

  for (const s of sessions) {
    const success = await SessionModel.incrementBookedCountIfCapacity(s._id);
    if (!success) {
      failedSessions.push(s._id);
    }
  }

  if (failedSessions.length > 0) {
    status = "WAITLISTED";
  }

  return BookingModel.create({
    userId,
    courseId,
    type: "COURSE",
    sessionIds: sessions.map((s) => s._id),
    status,
  });
}

export async function bookSessionForUser(userId, sessionId) {
  const session = await SessionModel.findById(sessionId);
  if (!session) throw new Error("Session not found");
  const course = await CourseModel.findById(session.courseId);
  if (!course) throw new Error("Course not found");

  if (!course.allowDropIn && course.type === "WEEKLY_BLOCK") {
    const err = new Error("Drop-in not allowed for this course");
    err.code = "DROPIN_NOT_ALLOWED";
    throw err;
  }

  const incrementedSuccessfully = await SessionModel.incrementBookedCountIfCapacity(sessionId);
  let status = "CONFIRMED";

  if (!incrementedSuccessfully) {
    status = "WAITLISTED";
  }

  return BookingModel.create({
    userId,
    courseId: course._id,
    type: "SESSION",
    sessionIds: [sessionId],
    status,
  });
}

export async function getBookingById(bookingId) {
  const booking = await BookingModel.findById(bookingId);
  if (!booking) {
    const err = new Error("Booking not found");
    err.code = "NOT_FOUND";
    throw err;
  }
  return booking;
}
