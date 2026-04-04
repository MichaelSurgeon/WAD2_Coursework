import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { fmtDate, fmtDateOnly } from "../utils/dateFormatter.js";

const calculateDurationWeeks = (startDate, endDate) => {
    if (!startDate || !endDate)
        return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end - start;
    const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, diffWeeks);
};

const formatDurationDisplay = (weeks) => {
    if (!weeks) return "TBA";
    return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
};

const formatCourseData = (course, sessions) => {
    const sessionsCount = sessions.length;
    const pricePerSession = course.price && sessionsCount ? (course.price / sessionsCount).toFixed(2) : null;

    let priceDisplay;
    if (course.allowDropIn && pricePerSession) {
        priceDisplay = `£${pricePerSession}/session or £${course.price} for full course`;
    } else if (course.price) {
        priceDisplay = `£${course.price}`;
    } else {
        priceDisplay = null;
    }

    return {
        id: course._id,
        title: course.title,
        level: course.level,
        type: course.type,
        description: course.description,
        location: course.location,
        price: course.price,
        pricePerSession: pricePerSession,
        priceDisplay,
        allowDropIn: course.allowDropIn,
        startDate: course.startDate ? fmtDateOnly(course.startDate) : "",
        endDate: course.endDate ? fmtDateOnly(course.endDate) : "",
        durationDisplay: formatDurationDisplay(calculateDurationWeeks(course.startDate, course.endDate)),
        nextSession: sessions[0] ? fmtDate(sessions[0].startDateTime) : "TBA",
        sessionsCount,
    };
};

export const CourseService = {
    async getAllCourses() {
        const courses = await CourseModel.list();
        const formattedCourses = await Promise.all(
            courses.map(async (c) => {
                const sessions = await SessionModel.listByCourse(c._id);
                return formatCourseData(c, sessions);
            })
        );
        return formattedCourses.filter(c => c.sessionsCount > 0);
    },

    async getFilterdCourses(level, type, allowDropIn, searchQuery) {
        const filter = {};
        if (level) filter.level = level;
        if (type) filter.type = type;
        if (allowDropIn !== undefined && allowDropIn !== null) filter.allowDropIn = allowDropIn;

        let courses = await CourseModel.list(filter);

        const query = (searchQuery || "").trim().toLowerCase();
        if (query) {
            courses = courses.filter(
                (c) =>
                    c.title?.toLowerCase().includes(query) ||
                    c.description?.toLowerCase().includes(query)
            );
        }

        courses.sort((a, b) => {
            const ad = a.startDate ? new Date(a.startDate).getTime() : Number.MAX_SAFE_INTEGER;
            const bd = b.startDate ? new Date(b.startDate).getTime() : Number.MAX_SAFE_INTEGER;
            if (ad !== bd) return ad - bd;
            return (a.title || "").localeCompare(b.title || "");
        });

        const formattedCourses = await Promise.all(
            courses.map(async (c) => {
                const sessions = await SessionModel.listByCourse(c._id);
                return formatCourseData(c, sessions);
            })
        );
        return formattedCourses.filter(c => c.sessionsCount > 0);
    },

    async getCourseById(courseId) {
        const course = await CourseModel.findById(courseId);
        if (!course) return null;

        const sessions = await SessionModel.listByCourse(courseId);
        const pricePerSession = course.price && sessions.length ? (course.price / sessions.length).toFixed(2) : null;

        return {
            ...formatCourseData(course, sessions),
            sessions: sessions.map((s) => ({
                _id: s._id,
                start: fmtDate(s.startDateTime),
                end: fmtDate(s.endDateTime),
                capacity: s.capacity,
                booked: s.bookedCount ?? 0,
                remaining: Math.max(0, (s.capacity ?? 0) - (s.bookedCount ?? 0)),
                isFull: (s.bookedCount ?? 0) >= (s.capacity ?? 0),
                startIso: s.startDateTime,
                endIso: s.endDateTime,
                allowDropIn: course.allowDropIn,
                pricePerSession: course.allowDropIn ? pricePerSession : null,
            })),
        };
    },

    async createCourse(data) {
        return CourseModel.create({
            title: data.title,
            description: data.description,
            level: data.level,
            type: data.type,
            location: data.location || null,
            price: data.price ? parseFloat(data.price) : null,
            startDate: data.startDate || null,
            endDate: data.endDate || null,
            allowDropIn: data.allowDropIn === "on" || data.allowDropIn === true,
            sessionIds: [],
        });
    },

    async updateCourse(courseId, data) {
        const updateData = {};

        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.level !== undefined) updateData.level = data.level;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.location !== undefined) updateData.location = data.location || null;
        if (data.price !== undefined) updateData.price = data.price ? parseFloat(data.price) : null;
        if (data.startDate !== undefined) updateData.startDate = data.startDate || null;
        if (data.endDate !== undefined) updateData.endDate = data.endDate || null;
        if (data.allowDropIn !== undefined) updateData.allowDropIn = data.allowDropIn === "on" || data.allowDropIn === true;
        if (data.sessionIds !== undefined) updateData.sessionIds = data.sessionIds;

        await CourseModel.update(courseId, updateData);
        return this.getCourseById(courseId);
    },

    async deleteCourse(courseId) {
        const sessions = await SessionModel.listByCourse(courseId);
        for (const session of sessions) {
            await SessionModel.delete(session._id);
        }
        return CourseModel.delete(courseId);
    },
};
