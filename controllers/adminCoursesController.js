import { CourseService } from "../services/courseService.js";
import { SessionService } from "../services/sessionService.js";
import { ValidationService } from "../services/validationService.js";
import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { BookingModel } from "../models/bookingModel.js";
import { UserModel } from "../models/userModel.js";
import { sendRenderError } from "../helpers/errorHandlers.js";
import { fmtDateOnly, fmtDateForInput } from "../utils/dateFormatter.js";

const renderCourseForm = (res, course, options = {}) => {
    const { title, user, errors, isEdit } = options;
    const formData = {
        ...course,
        beginner: course.level === "beginner",
        intermediate: course.level === "intermediate",
        advanced: course.level === "advanced",
        block: course.type === "WEEKLY_BLOCK",
        workshop: course.type === "WEEKEND_WORKSHOP",
    };
    res.render("pages/admin/course-form", {
        title,
        user,
        course: formData,
        ...formData,
        ...(errors && { errors }),
        ...(isEdit && { isEdit }),
    });
};

const buildSessionsRenderData = (user, course, formattedSessions, errors = null) => {
    const renderData = {
        title: `Add Sessions: ${course.title}`,
        user,
        course: {
            id: course.id,
            title: course.title,
            startDate: fmtDateOnly(course.startDate),
            endDate: fmtDateOnly(course.endDate),
        },
    };

    if (formattedSessions.length > 0) {
        renderData.sessionsList = {
            items: formattedSessions,
            count: formattedSessions.length,
        };
    }

    if (errors) {
        renderData.errors = { list: Array.isArray(errors) ? errors : [errors] };
    }

    return renderData;
};

export const listCourses = async (req, res, next) => {
    try {
        const { items, pagination } = await CourseService.getCoursesPaginated(
            req.query.page,
            req.query.pageSize
        );

        res.render("pages/admin/courses", {
            title: "Manage Courses",
            user: req.user,
            courses: items,
            pagination
        });
    } catch (err) {
        next(err);
    }
};

export const showAddCoursePage = (req, res) => {
    const defaultCourse = {
        title: "Example Course",
        description: "Explain about the course",
        level: "beginner",
        type: "WEEKLY_BLOCK",
        startDate: "",
        endDate: "",
        price: "",
        location: "",
        allowDropIn: false,
    };

    renderCourseForm(res, defaultCourse, {
        title: "Add Course",
        user: req.user,
    });
};

export const postAddCourse = async (req, res, next) => {
    try {
        const validationErrors = ValidationService.validateCourse(req.body);

        if (validationErrors) {
            renderCourseForm(res, req.body, {
                title: "Add Course",
                user: req.user,
                errors: { list: validationErrors },
            });
            return;
        }

        const course = await CourseService.createCourse(req.body);
        res.redirect(`/admin/courses/${course._id}/sessions`);
    } catch (err) {
        next(err);
    }
};

export const showEditCoursePage = async (req, res, next) => {
    try {
        const rawCourse = await CourseModel.findById(req.params.id);

        if (!rawCourse) {
            return sendRenderError(res, "Course not found");
        }

        renderCourseForm(res, {
            id: rawCourse._id,
            title: rawCourse.title,
            description: rawCourse.description,
            level: rawCourse.level,
            type: rawCourse.type,
            startDate: fmtDateForInput(rawCourse.startDate),
            endDate: fmtDateForInput(rawCourse.endDate),
            price: rawCourse.price || "",
            location: rawCourse.location || "",
            allowDropIn: rawCourse.allowDropIn,
        }, {
            title: `Edit Course: ${rawCourse.title}`,
            user: req.user,
            isEdit: true,
        });
    } catch (err) {
        next(err);
    }
};

export const postEditCourse = async (req, res, next) => {
    try {
        const validationErrors = ValidationService.validateCourse(req.body);

        if (validationErrors) {
            renderCourseForm(res, req.body, {
                title: `Edit Course: ${req.body.title}`,
                user: req.user,
                isEdit: true,
                errors: { list: validationErrors },
            });
            return;
        }

        await CourseService.updateCourse(req.params.id, req.body);
        res.redirect(`/admin/courses/${req.params.id}/sessions`);
    } catch (err) {
        next(err);
    }
};

export const deleteCourse = async (req, res, next) => {
    try {
        await CourseService.deleteCourse(req.params.id);
        res.redirect("/admin/courses");
    } catch (err) {
        next(err);
    }
};

export const showAddSessionsPage = async (req, res, next) => {
    try {
        const course = await CourseService.getCourseById(req.params.id);

        if (!course) {
            return sendRenderError(res, "Course not found");
        }

        const sessions = await SessionService.listByCourse(req.params.id);
        const mappedSessions = SessionService.formatSessionsForAdmin(sessions, course.id);
        const renderData = buildSessionsRenderData(req.user, course, mappedSessions);

        res.render("pages/admin/course-sessions", renderData);
    } catch (err) {
        next(err);
    }
};

export const postAddSession = async (req, res, next) => {
    try {
        const { startDateTime, endDateTime, capacity, location } = req.body;

        if (!startDateTime || !endDateTime || !capacity) {
            const course = await CourseService.getCourseById(req.params.id);
            const sessions = await SessionService.listByCourse(req.params.id);
            const mappedSessions = SessionService.formatSessionsForAdmin(sessions, course.id);
            const errorRenderData = buildSessionsRenderData(req.user, course, mappedSessions, "All session fields are required");

            return res.render("pages/admin/course-sessions", errorRenderData);
        }

        await SessionModel.create({
            courseId: req.params.id,
            startDateTime,
            endDateTime,
            capacity: parseInt(capacity, 10),
            location: location || null,
            bookedCount: 0,
        });

        const updatedSessions = await SessionService.listByCourse(req.params.id);
        await CourseService.updateCourse(req.params.id, {
            sessionIds: updatedSessions.map(s => s._id),
        });

        res.redirect(`/admin/courses/${req.params.id}/sessions`);
    } catch (err) {
        next(err);
    }
};

export const deleteSession = async (req, res, next) => {
    try {
        const sessions = await SessionService.listByCourse(req.params.id);
        const isLastSession = sessions.length === 1;

        await SessionService.deleteSession(req.params.sessionId);

        if (isLastSession) {
            await CourseService.deleteCourse(req.params.id);
            return res.redirect("/admin/courses");
        }

        const updatedSessions = await SessionService.listByCourse(req.params.id);
        await CourseService.updateCourse(req.params.id, {
            sessionIds: updatedSessions.map(s => s._id),
        });

        res.redirect(`/admin/courses/${req.params.id}/sessions`);
    } catch (err) {
        next(err);
    }
};

export const getClassList = async (req, res, next) => {
    try {
        const course = await CourseModel.findById(req.params.id);

        if (!course) {
            return sendRenderError(res, "Course not found");
        }

        const bookings = await BookingModel.findByCourse(req.params.id);
        const userIds = bookings.map(b => b.userId);
        const users = await UserModel.findByIds(userIds);
        const participants = bookings.map(booking => {
            const user = users.find(u => u._id === booking.userId);
            return { username: user?.username || "N/A", email: user?.email || "N/A" };
        });

        res.render("pages/admin/class-list", {
            title: `Class List: ${course.title}`,
            user: req.user,
            course: {
                title: course.title,
                id: course._id,
            },
            participants,
            count: participants.length,
        });
    } catch (err) {
        next(err);
    }
};

