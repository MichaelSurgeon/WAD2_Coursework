import { CourseService } from "../services/courseService.js";
import { SessionService } from "../services/sessionService.js";
import { ValidationService } from "../services/validationService.js";
import { sendRenderError } from "../helpers/errorHandlers.js";
import { fmtDateOnly } from "../utils/dateFormatter.js";

const renderCourseForm = (res, course, options = {}) => {
    const { title, user, errors, isEdit } = options;
    res.render("pages/admin/course-form", {
        title,
        user,
        course,
        beginner: course.level === "beginner",
        intermediate: course.level === "intermediate",
        advanced: course.level === "advanced",
        block: course.type === "WEEKLY_BLOCK",
        workshop: course.type === "WEEKEND_WORKSHOP",
        ...(errors && { errors }),
        ...(isEdit && { isEdit }),
    });
};

const loadSessionsForRender = async (courseId) => {
    const course = await CourseService.getCourseById(courseId);
    if (!course) return null;

    const sessions = await SessionService.listByCourse(courseId);
    const formatted = SessionService.formatSessionsForAdmin(sessions, courseId);
    return { course, sessions: formatted };
};

const DEFAULT_SESSION_FORM = {
    startDateTime: "",
    endDateTime: "",
    capacity: "18",
    location: "",
    description: "",
    price: "",
};

const buildSessionsRenderData = (user, course, formattedSessions, options = {}) => {
    const { errors = null, formValues = null, isEdit = false, editingSessionId = null } = options;
    const sessionForm = formValues || DEFAULT_SESSION_FORM;

    const renderData = {
        title: `Manage Sessions: ${course.title}`,
        user,
        course: {
            _id: course._id,
            title: course.title,
            startDate: fmtDateOnly(course.startDate),
            endDate: fmtDateOnly(course.endDate),
        },
        sessionForm,
        isEditSession: isEdit,
        ...(isEdit && { editingSessionId }),
    };

    if (formattedSessions.length > 0) {
        renderData.sessionsList = { items: formattedSessions, count: formattedSessions.length };
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

export const showAddCoursePage = (req, res, next) => {
    try {
        const defaultCourse = {
            title: "Example Course",
            description: "Explain about the course",
            level: "beginner",
            type: "WEEKLY_BLOCK",
            startDate: "",
            endDate: "",
            allowDropIn: false,
        };

        renderCourseForm(res, defaultCourse, {
            title: "Add Course",
            user: req.user,
        });
    } catch (err) {
        next(err);
    }
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
        const course = await CourseService.getCourseForEdit(req.params.id);
        if (!course) {
            return sendRenderError(res, "Course not found");
        }

        renderCourseForm(res, course, {
            title: `Edit Course: ${course.title}`,
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

export const showSessionsPage = async (req, res, next) => {
    try {
        const data = await loadSessionsForRender(req.params.id);
        if (!data)
            return sendRenderError(res, "Course not found");

        const renderData = buildSessionsRenderData(req.user, data.course, data.sessions);
        res.render("pages/admin/course-sessions", renderData);
    } catch (err) {
        next(err);
    }
};

export const postAddSession = async (req, res, next) => {
    try {
        const validationErrors = ValidationService.validateSession(req.body);
        if (validationErrors) {
            const data = await loadSessionsForRender(req.params.id);
            if (!data)
                return sendRenderError(res, "Course not found");

            const errorRenderData = buildSessionsRenderData(req.user, data.course, data.sessions, {
                errors: validationErrors,
                formValues: req.body,
            });
            return res.render("pages/admin/course-sessions", errorRenderData);
        }

        await SessionService.createSessionForCourse(req.params.id, req.body);
        res.redirect(`/admin/courses/${req.params.id}/sessions`);
    } catch (err) {
        next(err);
    }
};

export const showEditSessionPage = async (req, res, next) => {
    try {
        const data = await loadSessionsForRender(req.params.id);
        if (!data)
            return sendRenderError(res, "Course not found");

        const session = await SessionService.getSessionForEdit(req.params.id, req.params.sessionId);
        if (!session)
            return sendRenderError(res, "Session not found");

        const renderData = buildSessionsRenderData(req.user, data.course, data.sessions, {
            formValues: session,
            isEdit: true,
            editingSessionId: req.params.sessionId,
        });

        res.render("pages/admin/course-sessions", renderData);
    } catch (err) {
        next(err);
    }
};

export const postEditSession = async (req, res, next) => {
    try {
        const validationErrors = ValidationService.validateSession(req.body);
        if (validationErrors) {
            const data = await loadSessionsForRender(req.params.id);
            if (!data)
                return sendRenderError(res, "Course not found");

            const errorRenderData = buildSessionsRenderData(req.user, data.course, data.sessions, {
                errors: validationErrors,
                formValues: req.body,
                isEdit: true,
                editingSessionId: req.params.sessionId,
            });
            return res.render("pages/admin/course-sessions", errorRenderData);
        }

        await SessionService.updateSessionForCourse(req.params.id, req.params.sessionId, req.body);
        res.redirect(`/admin/courses/${req.params.id}/sessions`);
    } catch (err) {
        if (err.code === "NOT_FOUND") {
            return sendRenderError(res, "Session not found");
        }
        next(err);
    }
};

export const deleteSession = async (req, res, next) => {
    try {
        const deleteResult = await SessionService.deleteSessionFromCourse(req.params.id, req.params.sessionId);

        if (deleteResult.courseDeleted) {
            return res.redirect("/admin/courses");
        }

        res.redirect(`/admin/courses/${req.params.id}/sessions`);
    } catch (err) {
        next(err);
    }
};

export const getClassList = async (req, res, next) => {
    try {
        const classList = await CourseService.getClassListByCourseId(req.params.id);

        if (!classList) {
            return sendRenderError(res, "Course not found");
        }

        res.render("pages/admin/class-list", {
            title: `Class List: ${classList.course.title}`,
            user: req.user,
            course: classList.course,
            participants: classList.participants,
            count: classList.count,
        });
    } catch (err) {
        next(err);
    }
};

