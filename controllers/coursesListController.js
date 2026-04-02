import { CourseService } from "../services/courseService.js";
import {
  parsePaginationParams,
  buildLink,
  buildPaginationObject,
} from "../helpers/paginationHelpers.js";
import { parseDropInFilter } from "../helpers/dataTransformers.js";

export const coursesListPage = async (req, res, next) => {
  try {
    const { level, type, dropin, q, page, pageSize } = req.query;

    const allowDropIn = parseDropInFilter(dropin);
    const courses = await CourseService.getFilteredAndEnrichedCourses(level, type, allowDropIn, q);

    const { p, ps } = parsePaginationParams(page, pageSize);
    const total = courses.length;
    const totalPages = Math.ceil(total / ps) || 1;
    const pageItems = courses.slice((p - 1) * ps, p * ps);

    const hasActiveFilters = !!(level || type || dropin || q);

    res.render("pages/courses", {
      title: "Courses",
      user: req.user,
      filters: { level, type, dropin, q },
      hasActiveFilters,
      courses: pageItems,
      pagination: {
        ...buildPaginationObject(p, ps, total, totalPages),
        prevLink: p > 1 ? buildLink(req, p - 1, ps) : null,
        nextLink: p < totalPages ? buildLink(req, p + 1, ps) : null,
      },
    });
  } catch (err) {
    next(err);
  }
};

