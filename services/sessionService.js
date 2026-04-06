import { SessionModel } from "../models/sessionModel.js";
import { CourseModel } from "../models/courseModel.js";
import { fmtDate } from "../utils/dateFormatter.js";

const toDateTimeLocalValue = (isoDateTime) => {
    if (!isoDateTime) return "";
    const date = new Date(isoDateTime);
    if (Number.isNaN(date.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const normalizePrice = (price) => {
    if (price === "" || price === undefined || price === null)
        return null;
    return parseFloat(price);
};

const normalizeSessionData = (data) => ({
    startDateTime: data.startDateTime,
    endDateTime: data.endDateTime,
    capacity: parseInt(data.capacity, 10),
    location: data.location?.trim() || null,
    description: data.description?.trim() || null,
    price: normalizePrice(data.price),
});

export const SessionService = {
    async listByCourse(courseId) {
        return SessionModel.listByCourse(courseId);
    },

    async createSessionForCourse(courseId, data) {
        const sessionData = normalizeSessionData(data);
        const createdSession = await SessionModel.create({
            courseId,
            ...sessionData,
            bookedCount: 0,
        });

        const updatedSessions = await SessionModel.listByCourse(courseId);
        await CourseModel.update(courseId, {
            sessionIds: updatedSessions.map((s) => s._id),
        });

        return createdSession;
    },

    async getSessionForEdit(courseId, sessionId) {
        const session = await SessionModel.findById(sessionId);
        if (!session || session.courseId !== courseId) {
            return null;
        }

        return {
            _id: session._id,
            courseId: session.courseId,
            startDateTime: toDateTimeLocalValue(session.startDateTime),
            endDateTime: toDateTimeLocalValue(session.endDateTime),
            capacity: session.capacity,
            location: session.location || "",
            description: session.description || "",
            price: session.price ?? "",
        };
    },

    async updateSessionForCourse(courseId, sessionId, data) {
        const existingSession = await SessionModel.findById(sessionId);
        if (!existingSession || existingSession.courseId !== courseId) {
            const err = new Error("Session not found");
            err.code = "NOT_FOUND";
            throw err;
        }

        return SessionModel.update(sessionId, normalizeSessionData(data));
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
            sessionIds: updatedSessions.map((s) => s._id),
        });

        return { courseDeleted: false };
    },

    formatSessionForAdmin(session, courseId) {
        return {
            _id: session._id,
            start: fmtDate(session.startDateTime),
            end: fmtDate(session.endDateTime),
            capacity: session.capacity,
            location: session.location || "-",
            description: session.description || "-",
            priceDisplay: session.price == null ? "-" : `£${Number(session.price).toFixed(2)}`,
            courseId,
        };
    },

    formatSessionsForAdmin(sessions, courseId) {
        return sessions.map(s => this.formatSessionForAdmin(s, courseId));
    },
};
