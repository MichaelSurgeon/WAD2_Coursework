import { CourseService } from "../services/courseService.js";

export const coursesListPage = async (req, res, next) => {
  try {
    const filters = {
      q: req.query.q?.trim() || "",
      level: req.query.level || "",
      type: req.query.type || "",
    };

    const { items, pagination } = await CourseService.getCoursesPaginated(
      req.query.page,
      req.query.pageSize,
      filters
    );

    res.render("pages/courses", {
      title: "Courses",
      user: req.user,
      courses: items,
      pagination,
      filters: {
        ...filters,
        levelBeginner: filters.level === "beginner",
        levelIntermediate: filters.level === "intermediate",
        levelAdvanced: filters.level === "advanced",
        typeWeeklyBlock: filters.type === "WEEKLY_BLOCK",
        typeWeekendWorkshop: filters.type === "WEEKEND_WORKSHOP",
      },
    });
  } catch (err) {
    next(err);
  }
};

