import { CourseService } from "../services/courseService.js";
import { SessionService } from "../services/sessionService.js";
import { ValidationService } from "../services/validationService.js";
import { CourseModel } from "../models/courseModel.js";
import { SessionModel } from "../models/sessionModel.js";
import { BookingModel } from "../models/bookingModel.js";
import { UserModel } from "../models/userModel.js";
import { formatCourseData, buildCourseFormData, renderCourseForm, buildSessionsRenderData } from "../helpers/requestHelpers.js";
import { paginateCourses } from "../helpers/paginationHelpers.js";
import { sendRenderError } from "../helpers/errorHandlers.js";
import { fmtDateOnly, fmtDateForInput } from "../utils/dateFormatter.js";

export const listCourses = async (req, res, next) => {
    try {
        const courses = await CourseService.getAllCourses();
        const { pageItems, pagination } = paginateCourses(courses, req.query.page, req.query.pageSize, req);

        res.render("pages/admin/courses", {
            title: "Manage Courses",
            user: req.user,
            courses: pageItems,
            pagination,
        });
    } catch (err) {
        next(err);
    }
};

export const showAddCoursePage = (req, res) => {
    const defaultCourse = {
        title: "",
        description: "",
        level: "beginner",
        type: "WEEKLY_BLOCK",
        startDate: "",
        endDate: "",
        price: "",
        location: "",
        allowDropIn: false,
    };
    const formData = buildCourseFormData(defaultCourse);
    renderCourseForm(res, formData, {
        title: "Add Course",
        user: req.user,
        course: formData,
    });
};

export const postAddCourse = async (req, res, next) => {
    try {
        const validationErrors = ValidationService.validateCourse(req.body);

        if (validationErrors) {
            const formData = buildCourseFormData(req.body);
            renderCourseForm(res, formData, {
                title: "Add Course",
                user: req.user,
                course: formData,
                errors: { list: validationErrors },
            });
            return;
        }

        const course = await CourseService.createCourse(formatCourseData(req.body));
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

        const formData = buildCourseFormData({
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
        });

        renderCourseForm(res, formData, {
            title: `Edit Course: ${rawCourse.title}`,
            user: req.user,
            course: formData,
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
            const formData = buildCourseFormData(req.body);
            renderCourseForm(res, formData, {
                title: `Edit Course: ${req.body.title}`,
                user: req.user,
                course: formData,
                isEdit: true,
                errors: { list: validationErrors },
            });
            return;
        }

        await CourseService.updateCourse(req.params.id, formatCourseData(req.body));
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
        const renderData = buildSessionsRenderData(req.user, course, mappedSessions, null, fmtDateOnly);

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
            const errorRenderData = buildSessionsRenderData(req.user, course, mappedSessions, "All session fields are required", fmtDateOnly);

            return res.render("pages/admin/course-sessions", errorRenderData);
        }

        await SessionModel.create({
            courseId: req.params.id,
            startDateTime,
            endDateTime,
            capacity: parseInt(capacity),
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
        const participants = [];

        for (const booking of bookings) {
            const user = await UserModel.findById(booking.userId);
            participants.push({ username: user?.username || "N/A", email: user?.email || "N/A" });
        }

        res.render("pages/admin/class-list", {
            title: `Class List: ${course.title}`,
            user: req.user,
            course: {
                title: course.title,
                id: course.id,
            },
            participants,
            count: participants.length,
        });
    } catch (err) {
        next(err);
    }
};

