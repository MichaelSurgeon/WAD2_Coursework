import { SessionModel } from "../models/sessionModel.js";
import { CourseModel } from "../models/courseModel.js";
import { fmtDate } from "../utils/dateFormatter.js";

export const SessionService = {
    async getSessionById(sessionId) {
        const session = await SessionModel.findById(sessionId);
        if (!session) return null;

        const course = await CourseModel.findById(session.courseId);

        return {
            _id: session._id,
            courseId: session.courseId,
            courseName: course?.title,
            startDateTime: session.startDateTime,
            endDateTime: session.endDateTime,
            start: fmtDate(session.startDateTime),
            end: fmtDate(session.endDateTime),
            capacity: session.capacity,
            booked: session.bookedCount ?? 0,
            remaining: Math.max(0, (session.capacity ?? 0) - (session.bookedCount ?? 0)),
            isFull: (session.bookedCount ?? 0) >= (session.capacity ?? 0),
        };
    },

    async createSession(courseId, data) {
        return SessionModel.create({
            courseId,
            startDateTime: data.startDateTime,
            endDateTime: data.endDateTime,
            capacity: parseInt(data.capacity) || 0,
            bookedCount: 0,
        });
    },

    async updateSession(sessionId, data) {
        await SessionModel.update(sessionId, {
            startDateTime: data.startDateTime,
            endDateTime: data.endDateTime,
            capacity: parseInt(data.capacity) || 0,
        });
        return this.getSessionById(sessionId);
    },

    async deleteSession(sessionId) {
        return SessionModel.delete(sessionId);
    },

    async incrementBooking(sessionId) {
        const session = await SessionModel.findById(sessionId);
        if (!session) throw new Error("Session not found");

        if ((session.bookedCount ?? 0) >= (session.capacity ?? 0)) {
            return "WAITLISTED";
        }

        await SessionModel.incrementBookedCount(sessionId, 1);
        return "CONFIRMED";
    },
};
