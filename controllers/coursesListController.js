import { CourseService } from "../services/courseService.js";

export const coursesListPage = async (req, res, next) => {
  try {
    const { items, pagination } = await CourseService.getCoursesPaginated(
      req.query.page,
      req.query.pageSize
    );

    res.render("pages/courses", {
      title: "Courses",
      user: req.user,
      courses: items,
      pagination,
    });
  } catch (err) {
    next(err);
  }
};

