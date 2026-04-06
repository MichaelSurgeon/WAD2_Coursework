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

    const query = getFilteredQuery(filters);

    const [items, total] = await Promise.all([
      coursesDb.find(query).skip((p - 1) * ps).limit(ps),
      coursesDb.count(query)
    ]);

    const totalPages = Math.ceil(total / ps) || 1;

    return {
      items,
      pagination: {
        page: p,
        totalPages,
        pageSize: ps,
        prevLink: p > 1 ? `?page=${p - 1}&pageSize=${ps}` : null,
        nextLink: p < totalPages ? `?page=${p + 1}&pageSize=${ps}` : null,
        hasPrev: p > 1,
        hasNext: p < totalPages,
        total,
        startItem: (p - 1) * ps + 1,
        endItem: Math.min(p * ps, total)
      }
    };
  }
};

function getFilteredQuery(filters) {
  const query = {};
  if (filters.level) {
    query.level = filters.level;
  }

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.allowDropIn !== undefined) {
    query.allowDropIn = filters.allowDropIn;
  }

  if (filters.q?.trim()) {
    const q = filters.q.trim();
    query.$or = [{ title: new RegExp(q, "i") }, { description: new RegExp(q, "i") }];
  }

  return query;
}

