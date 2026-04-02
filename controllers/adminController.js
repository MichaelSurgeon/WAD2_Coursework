import { CourseService } from "../services/courseService.js";
import { UserService } from "../services/userService.js";
import { ValidationService } from "../services/validationService.js";
import { formatCourseForAdmin, formatUserForAdmin } from "../helpers/dataTransformers.js";
import { formatCourseData } from "../helpers/requestHelpers.js";

export const adminDashboard = async (req, res, next) => {
    try {
        const courses = await CourseService.getAllCourses();
        const users = await UserService.getAllUsers();

        res.render("pages/admin/dashboard", {
            title: "Admin Dashboard",
            user: req.user,
            coursesCount: courses.length,
            usersCount: users.length,
        });
    } catch (err) {
        next(err);
    }
};

export const listCourses = async (req, res, next) => {
    try {
        const courses = await CourseService.getAllCourses();

        res.render("pages/admin/courses", {
            title: "Manage Courses",
            user: req.user,
            courses: courses.map(formatCourseForAdmin),
        });
    } catch (err) {
        next(err);
    }
};

export const showAddCoursePage = (req, res) => {
    res.render("pages/admin/course-form", {
        title: "Add Course",
        user: req.user,
        course: { allowDropIn: false },
    });
};

export const postAddCourse = async (req, res, next) => {
    try {
        const validationErrors = ValidationService.validateCourse(req.body);

        if (validationErrors) {
            return res.render("pages/admin/course-form", {
                title: "Add Course",
                user: req.user,
                course: req.body,
                errors: { list: validationErrors },
            });
        }

        const course = await CourseService.createCourse(formatCourseData(req.body));
        res.redirect(`/admin/courses/${course._id}/edit`);
    } catch (err) {
        next(err);
    }
};

export const showEditCoursePage = async (req, res, next) => {
    try {
        const course = await CourseService.getCourseById(req.params.id);

        if (!course) {
            return res.status(404).render("pages/error", {
                title: "Not Found",
                message: "Course not found",
            });
        }

        res.render("pages/admin/course-form", {
            title: `Edit Course: ${course.title}`,
            user: req.user,
            course: {
                id: course.id,
                title: course.title,
                description: course.description,
                level: course.level,
                type: course.type,
                startDate: course.startDate || "",
                endDate: course.endDate || "",
                price: course.price || "",
                location: course.location || "",
                allowDropIn: course.allowDropIn,
            },
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
            return res.render("pages/admin/course-form", {
                title: `Edit Course: ${req.body.title}`,
                user: req.user,
                course: req.body,
                isEdit: true,
                errors: { list: validationErrors },
            });
        }

        await CourseService.updateCourse(req.params.id, formatCourseData(req.body));
        res.redirect("/admin/courses");
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

export const listUsers = async (req, res, next) => {
    try {
        const users = await UserService.getAllUsers();

        res.render("pages/admin/users", {
            title: "Manage Users",
            user: req.user,
            users: users.map(formatUserForAdmin),
        });
    } catch (err) {
        next(err);
    }
};

export const promoteUserToOrganiser = async (req, res, next) => {
    try {
        await UserService.promoteToOrganiser(req.params.id);
        res.redirect("/admin/users");
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        await UserService.deleteUser(req.params.id);
        res.redirect("/admin/users");
    } catch (err) {
        next(err);
    }
};
