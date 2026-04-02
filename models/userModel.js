
// models/userModel.js
import bcrypt from "bcrypt";
import { usersDb } from "./_db.js";

export const UserModel = {
  async create(user) {
    // Create a copy to avoid mutating the original object
    const userToInsert = { ...user };
    // Hash password if provided
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

  async findById(id) {
    return usersDb.findOne({ _id: id });
  },

  async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },
};

