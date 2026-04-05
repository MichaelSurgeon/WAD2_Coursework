
import { sessionsDb } from './_db.js';

export const SessionModel = {
  async create(session) {
    return await sessionsDb.insert(session);
  },
  async listByCourse(courseId) {
    return await sessionsDb.find({ courseId }).sort({ startDateTime: 1 });
  },
  async findById(id) {
    return await sessionsDb.findOne({ _id: id });
  },
  async incrementBookedCount(id, delta = 1) {
    const s = await this.findById(id);
    if (!s) throw new Error('Session not found');
    const next = (s.bookedCount ?? 0) + delta;
    if (next < 0) throw new Error('Booked count cannot be negative');
    await sessionsDb.update({ _id: id }, { $set: { bookedCount: next } });
    return await this.findById(id);
  },

  async incrementBookedCountIfCapacity(id) {
    const s = await this.findById(id);
    if (!s) throw new Error('Session not found');

    const currentCount = s.bookedCount ?? 0;
    const capacity = s.capacity ?? 0;

    if (currentCount >= capacity) {
      return false;
    }

    await sessionsDb.update({ _id: id }, { $set: { bookedCount: currentCount + 1 } });
    return true;
  },

  async update(id, patch) {
    await sessionsDb.update({ _id: id }, { $set: patch });
    return await this.findById(id);
  },

  async delete(id) {
    return await sessionsDb.remove({ _id: id });
  },

  async getSessionByUserAndCourse(userId, courseId) {
    return await sessionsDb.findOne({ userId, courseId });
  }
};
