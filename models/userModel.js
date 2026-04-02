
import { usersDb } from "./_db.js";

export const UserModel = {
  async create(user) {
    const userToInsert = { ...user };
    return usersDb.insert(userToInsert);
  },

  async findByUsername(username) {
    return usersDb.findOne({ username });
  },

  async findByEmail(email) {
    return usersDb.findOne({ email });
  },

  async findById(id) {
    return usersDb.findOne({ _id: id });
  },

  async list() {
    return usersDb.find({});
  },

  async update(id, updates) {
    return usersDb.update({ _id: id }, { $set: updates });
  },

  async delete(id) {
    return usersDb.remove({ _id: id });
  },
};

