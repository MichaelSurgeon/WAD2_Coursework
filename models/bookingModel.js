
import { bookingsDb } from './_db.js';

export const BookingModel = {
  async create(booking) {
    return await bookingsDb.insert({ ...booking, createdAt: new Date().toISOString() });
  },
  async findById(id) {
    return await bookingsDb.findOne({ _id: id });
  },
  async findByCourse(courseId) {
    return await bookingsDb.find({ courseId });
  },
  async findByUserAndCourse(userId, courseId) {
    return await bookingsDb.findOne({ userId, courseId });
  }
};
