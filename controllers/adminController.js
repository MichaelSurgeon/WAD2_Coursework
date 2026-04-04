import { CourseService } from "../services/courseService.js";
import { UserService } from "../services/userService.js";

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
