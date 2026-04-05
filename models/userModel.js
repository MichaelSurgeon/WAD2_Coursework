
import { usersDb } from "./_db.js";
import bcrypt from "bcrypt";

export const UserModel = {
  async create(user) {
    const userToInsert = { ...user };

    if (userToInsert.password) {
      userToInsert.password = await bcrypt.hash(userToInsert.password, 10);
    }

    return await usersDb.insert(userToInsert);
  },

  async findByUsername(username) {
    return await usersDb.findOne({ username });
  },

  async findByEmail(email) {
    return await usersDb.findOne({ email });
  },

  async findById(id) {
    return await usersDb.findOne({ _id: id });
  },

  async list() {
    return await usersDb.find({});
  },

  async findByIds(ids) {
    return await usersDb.find({ _id: { $in: ids } });
  },

  async update(id, updates) {
    return await usersDb.update({ _id: id }, { $set: updates });
  },

  async delete(id) {
    return await usersDb.remove({ _id: id });
  },
};

