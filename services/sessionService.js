import { SessionModel } from "../models/sessionModel.js";
import { CourseModel } from "../models/courseModel.js";
import { fmtDate } from "../utils/dateFormatter.js";

export const SessionService = {
    async listByCourse(courseId) {
        return SessionModel.listByCourse(courseId);
    },

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

    async deleteSession(sessionId) {
        return SessionModel.delete(sessionId);
    },

    formatSessionForAdmin(session, courseId) {
        return {
            _id: session._id,
            start: fmtDate(session.startDateTime),
            capacity: session.capacity,
            location: session.location || "-",
            courseId,
        };
    },

    formatSessionsForAdmin(sessions, courseId) {
        return sessions.map(s => this.formatSessionForAdmin(s, courseId));
    },
};
