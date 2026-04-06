import { coursesDb } from "./_db.js";

export const CourseModel = {
  async create(course) {
    return coursesDb.insert(course);
  },
  async findById(id) {
    return coursesDb.findOne({ _id: id });
  },
  async update(id, patch) {
    await coursesDb.update({ _id: id }, { $set: patch });
    return this.findById(id);
  },
  async delete(id) {
    return coursesDb.remove({ _id: id });
  },
  async getCourseCount() {
    return coursesDb.count();
  },
  async getCourses({ limit, sort, filter } = {}) {
    let query = coursesDb.find(filter || {});
    if (sort) query = query.sort(sort);
    if (limit) query = query.limit(limit);
    return query;
  },
  async getPaginatedCourses(page, pageSize, filters = {}) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.max(1, parseInt(pageSize, 10) || 4);

    const queryFilter = {};
    if (filters.level) queryFilter.level = filters.level;
    if (filters.type) queryFilter.type = filters.type;
    if (filters.q) {
      const escaped = filters.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      queryFilter.$or = [
        { title: new RegExp(escaped, "i") },
        { description: new RegExp(escaped, "i") },
      ];
    }

    const buildPageLink = (pageNumber) => {
      const entries = [
        ["page", String(pageNumber)],
        ["pageSize", String(ps)],
      ];

      if (filters.q) entries.push(["q", filters.q]);
      if (filters.level) entries.push(["level", filters.level]);
      if (filters.type) entries.push(["type", filters.type]);

      const queryString = entries
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join("&");

      return `?${queryString}`;
    };

    const [items, total] = await Promise.all([
      coursesDb.find(queryFilter).skip((p - 1) * ps).limit(ps),
      coursesDb.count(queryFilter)
    ]);

    const totalPages = Math.ceil(total / ps) || 1;

    return {
      items,
      pagination: {
        page: p,
        totalPages,
        pageSize: ps,
        prevLink: p > 1 ? buildPageLink(p - 1) : null,
        nextLink: p < totalPages ? buildPageLink(p + 1) : null,
        hasPrev: p > 1,
        hasNext: p < totalPages,
        total,
        startItem: (p - 1) * ps + 1,
        endItem: Math.min(p * ps, total)
      }
    };
  }
};

