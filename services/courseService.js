import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { BookingModel } from "../models/bookingModel.js";
import { UserModel } from "../models/userModel.js";
import { fmtDate, fmtDateOnly, fmtDateForInput } from "../utils/dateFormatter.js";

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

const getDurationDisplay = (startDate, endDate) => {
    if (!startDate || !endDate)
        return "TBA";

    const weeks = Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / MS_PER_WEEK));
    return `${weeks} ${weeks === 1 ? "week" : "weeks"}`;
};

const formatCourseData = (course, sessionCount) => {
    return {
        _id: course._id,
        title: course.title,
        level: course.level,
        type: course.type,
        description: course.description,
        allowDropIn: course.allowDropIn,
        startDate: course.startDate ? fmtDateOnly(course.startDate) : "",
        endDate: course.endDate ? fmtDateOnly(course.endDate) : "",
        durationDisplay: getDurationDisplay(course.startDate, course.endDate),
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
                location: s.location || "",
                description: s.description || "",
                priceDisplay: s.price === undefined || s.price === null ? "-" : `£${Number(s.price).toFixed(2)}`,
                allowDropIn: course.allowDropIn,
            })),
        };
    },

    async getCourseForEdit(courseId) {
        const course = await CourseModel.findById(courseId);
        if (!course)
            return null;

        return {
            _id: course._id,
            title: course.title,
            description: course.description,
            level: course.level,
            type: course.type,
            startDate: fmtDateForInput(course.startDate),
            endDate: fmtDateForInput(course.endDate),
            allowDropIn: course.allowDropIn,
        };
    },

    async getClassListByCourseId(courseId) {
        const course = await CourseModel.findById(courseId);
        if (!course)
            return null;

        const bookings = await BookingModel.findByCourse(courseId);
        const userIds = bookings.map((booking) => booking.userId);
        const users = userIds.length > 0 ? await UserModel.findByIds(userIds) : [];
        const participants = bookings.map((booking) => {
            const user = users.find((u) => u._id === booking.userId);
            return {
                username: user?.username || "N/A",
                email: user?.email || "N/A",
            };
        });

        return {
            course: {
                _id: course._id,
                title: course.title,
            },
            participants,
            count: participants.length,
        };
    },

    async createCourse(course) {
        return CourseModel.create({
            title: course.title,
            description: course.description,
            level: course.level,
            type: course.type,
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