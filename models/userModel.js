
import { usersDb } from "./_db.js";
import bcrypt from "bcrypt";

export const UserModel = {
  async create(user) {
    const userToInsert = { ...user };

    if (userToInsert.password) {
      userToInsert.password = await bcrypt.hash(userToInsert.password, 10);
    }

    return usersDb.insert(userToInsert);
  },

  async findByUsername(username) {
    return usersDb.findOne({ username });
  },

  async findByEmail(email) {
    return usersDb.findOne({ email });
  },

  async list() {
    return usersDb.find({});
  },

  async findByIds(ids) {
    return usersDb.find({ _id: { $in: ids } });
  },

  async update(id, updates) {
    return usersDb.update({ _id: id }, { $set: updates });
  },

  async delete(id) {
    return usersDb.remove({ _id: id });
  },

  async getUserCount() {
    return usersDb.count();
  }
};

