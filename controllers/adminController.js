import { CourseService } from "../services/courseService.js";
import { UserService } from "../services/userService.js";

export const adminDashboard = async (req, res, next) => {
    try {

        const [coursesCount, usersCount] = await Promise.all([
            CourseService.getCourseCount(),
            UserService.getTotalUserCount()
        ]);

        res.render("pages/admin/dashboard", {
            title: "Admin Dashboard",
            user: req.user,
            coursesCount,
            usersCount,
        });
    } catch (err) {
        next(err);
    }
};
