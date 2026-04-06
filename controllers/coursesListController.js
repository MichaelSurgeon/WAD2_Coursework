import { CourseService } from "../services/courseService.js";

const parseDropInFilter = (dropin) => {
  const dropInMap = { yes: true, no: false };
  return dropInMap[dropin];
};

export const coursesListPage = async (req, res, next) => {
  try {
    const { level, type, dropin, q } = req.query;
    const searchText = q?.trim() || "";
    const allowDropIn = parseDropInFilter(dropin);

    const { items, pagination } = await CourseService.getCoursesPaginated(
      req.query.page,
      req.query.pageSize,
      { level, type, allowDropIn, q: searchText }
    );

    const selectedFilters = {
      level,
      type,
      dropin,
      q: searchText,
      isBeginner: level === "beginner",
      isIntermediate: level === "intermediate",
      isAdvanced: level === "advanced",
      isWeekly: type === "WEEKLY_BLOCK",
      isWeekend: type === "WEEKEND_WORKSHOP",
      isYes: dropin === "yes",
      isNo: dropin === "no",
    };

    const hasActiveFilters = !!(level || type || dropin || searchText);

    let filterQueryString = "";
    if (level)
      filterQueryString += `level=${encodeURIComponent(level)}`;
    if (type)
      filterQueryString += `${filterQueryString ? "&" : ""}type=${encodeURIComponent(type)}`;
    if (dropin)
      filterQueryString += `${filterQueryString ? "&" : ""}dropin=${encodeURIComponent(dropin)}`;
    if (searchText)
      filterQueryString += `${filterQueryString ? "&" : ""}q=${encodeURIComponent(searchText)}`;

    if (filterQueryString) {
      if (pagination.hasPrev)
        pagination.prevLink += `&${filterQueryString}`;
      if (pagination.hasNext)
        pagination.nextLink += `&${filterQueryString}`;
    }

    res.render("pages/courses", {
      title: "Courses",
      user: req.user,
      filters: selectedFilters,
      hasActiveFilters,
      courses: items,
      pagination,
    });
  } catch (err) {
    next(err);
  }
};

