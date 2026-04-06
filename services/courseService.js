import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { fmtDate, fmtDateOnly } from "../utils/dateFormatter.js";

const calculateDurationWeeks = (startDate, endDate) => {
    if (!startDate || !endDate) return null;
    const diffMs = new Date(endDate) - new Date(startDate);
    return Math.max(1, Math.round(diffMs / (7 * 24 * 60 * 60 * 1000)));
};

const formatDurationDisplay = (weeks) => {
    if (!weeks) return "TBA";
    return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
};

const formatCourseData = (course, sessionCount) => {
    const pricePerSession = course.price && sessionCount ? (course.price / sessionCount).toFixed(2) : null;

    let priceDisplay;
    if (course.allowDropIn && pricePerSession) {
        priceDisplay = `£${pricePerSession}/session or £${course.price} for full course`;
    } else if (course.price) {
        priceDisplay = `£${course.price}`;
    } else {
        priceDisplay = null;
    }

    return {
        _id: course._id,
        title: course.title,
        level: course.level,
        type: course.type,
        description: course.description,
        location: course.location,
        price: course.price,
        pricePerSession,
        priceDisplay,
        allowDropIn: course.allowDropIn,
        startDate: course.startDate ? fmtDateOnly(course.startDate) : "",
        endDate: course.endDate ? fmtDateOnly(course.endDate) : "",
        durationDisplay: formatDurationDisplay(calculateDurationWeeks(course.startDate, course.endDate)),
        sessionsCount: sessionCount,
    };
};

export const CourseService = {
    async getFeaturedCourses() {
        const featuredCourses = await CourseModel.getCourses({
            limit: 2,
            sort: { createdAt: -1 },
            filter: { $where: function () { return this.sessionIds && this.sessionIds.length > 0; } }
        });

        const formattedCourses = featuredCourses.map(course => {
            return formatCourseData(course, course.sessionIds.length);
        });

        return formattedCourses;
    },

    async getCoursesPaginated(page, pageSize, filters = {}) {
        const result = await CourseModel.getPaginatedCourses(page, pageSize, filters);
        return {
            ...result,
            items: result.items.map(course => formatCourseData(course, course.sessionIds?.length || 0)),
        };
    },

    async getCourseCount() {
        return CourseModel.getCourseCount();
    },

    async getCourseById(courseId) {
        const course = await CourseModel.findById(courseId);
        if (!course)
            return null;

        const sessions = await SessionModel.listByCourse(courseId);
        const formatted = formatCourseData(course, course.sessionIds.length);

        return {
            ...formatted,
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
                pricePerSession: course.allowDropIn ? formatted.pricePerSession : null,
            })),
        };
    },

    async createCourse(course) {
        return CourseModel.create({
            title: course.title,
            description: course.description,
            level: course.level,
            type: course.type,
            location: course.location || null,
            price: course.price ? parseFloat(course.price) : null,
            startDate: course.startDate || null,
            endDate: course.endDate || null,
            allowDropIn: course.allowDropIn === "on" || course.allowDropIn === true,
            sessionIds: [],
        });
    },

    async updateCourse(courseId, course) {
        const updateData = {};
        if (course.title !== undefined) updateData.title = course.title;
        if (course.description !== undefined) updateData.description = course.description;
        if (course.level !== undefined) updateData.level = course.level;
        if (course.type !== undefined) updateData.type = course.type;
        if (course.location !== undefined) updateData.location = course.location || null;
        if (course.price !== undefined) updateData.price = course.price ? parseFloat(course.price) : null;
        if (course.startDate !== undefined) updateData.startDate = course.startDate || null;
        if (course.endDate !== undefined) updateData.endDate = course.endDate || null;
        if (course.allowDropIn !== undefined) updateData.allowDropIn = course.allowDropIn === "on" || course.allowDropIn === true;
        if (course.sessionIds !== undefined) updateData.sessionIds = course.sessionIds;

        await CourseModel.update(courseId, updateData);
        return this.getCourseById(courseId);
    },

    async deleteCourse(courseId) {
        const sessions = await SessionModel.listByCourse(courseId);
        await Promise.all(sessions.map(s => SessionModel.delete(s._id)));
        return CourseModel.delete(courseId);
    },
};