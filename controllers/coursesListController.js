import { CourseService } from "../services/courseService.js";
import { paginateCourses } from "../helpers/paginationHelpers.js";
import { parseDropInFilter } from "../helpers/dataTransformers.js";

export const coursesListPage = async (req, res, next) => {
  try {
    const { level, type, dropin, q } = req.query;

    const allowDropIn = parseDropInFilter(dropin);
    const courses = await CourseService.getFilterdCourses(level, type, allowDropIn, q);

    const { pageItems, pagination } = paginateCourses(courses, req.query.page, req.query.pageSize, req);
    const hasActiveFilters = !!(level || type || dropin || q);

    res.render("pages/courses", {
      title: "Courses",
      user: req.user,
      filters: { level, type, dropin, q },
      hasActiveFilters,
      courses: pageItems,
      pagination,
    });
  } catch (err) {
    next(err);
  }
};

