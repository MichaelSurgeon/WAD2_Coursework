import { CourseService } from "../services/courseService.js";

const parseDropInFilter = (dropin) => {
  const dropInMap = { yes: true, no: false };
  return dropInMap[dropin];
};

export const coursesListPage = async (req, res, next) => {
  try {
    const { level, type, dropin, q } = req.query;

    const allowDropIn = parseDropInFilter(dropin);

    const { items, pagination } = await CourseService.getCoursesPaginated(
      req.query.page,
      req.query.pageSize,
      { level, type, allowDropIn, q }
    );

    const hasActiveFilters = !!(level || type || dropin || q);

    res.render("pages/courses", {
      title: "Courses",
      user: req.user,
      filters: { level, type, dropin, q },
      hasActiveFilters,
      courses: items,
      pagination,
    });
  } catch (err) {
    next(err);
  }
};

