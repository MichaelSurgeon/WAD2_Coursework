import { SessionModel } from "../models/sessionModel.js";
import { CourseModel } from "../models/courseModel.js";
import { fmtDate } from "../utils/dateFormatter.js";

export const SessionService = {
    async listByCourse(courseId) {
        return SessionModel.listByCourse(courseId);
    },

    async createSessionForCourse(courseId, data) {
        const { startDateTime, endDateTime, capacity, location } = data;

        const createdSession = await SessionModel.create({
            courseId,
            startDateTime,
            endDateTime,
            capacity: parseInt(capacity, 10),
            location: location || null,
            bookedCount: 0,
        });

        const updatedSessions = await SessionModel.listByCourse(courseId);
        await CourseModel.update(courseId, {
            sessionIds: updatedSessions.map((session) => session._id),
        });

        return createdSession;
    },

    async deleteSessionFromCourse(courseId, sessionId) {
        const sessions = await SessionModel.listByCourse(courseId);
        const isLastSession = sessions.length === 1;

        await SessionModel.delete(sessionId);

        if (isLastSession) {
            await CourseModel.delete(courseId);
            return { courseDeleted: true };
        }

        const updatedSessions = await SessionModel.listByCourse(courseId);
        await CourseModel.update(courseId, {
            sessionIds: updatedSessions.map((session) => session._id),
        });

        return { courseDeleted: false };
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
