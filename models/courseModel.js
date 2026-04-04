import { coursesDb } from "./_db.js";

export const CourseModel = {
  async create(course) {
    return await coursesDb.insert(course);
  },
  async findById(id) {
    return await coursesDb.findOne({ _id: id });
  },
  async list(filter = {}) {
    return await coursesDb.find(filter);
  },
  async update(id, patch) {
    await coursesDb.update({ _id: id }, { $set: patch });
    return await this.findById(id);
  },

  async delete(id) {
    return await coursesDb.remove({ _id: id });
  },
};
