import { UserModel } from "../models/userModel.js";

export const UserService = {
    async getAllUsers() {
        const users = await UserModel.list();
        return users.map((u) => ({
            id: u._id,
            username: u.username,
            email: u.email,
            role: u.role,
        }));
    },

    async getUserById(userId) {
        return UserModel.findById(userId);
    },

    async getUserByUsername(username) {
        return UserModel.findByUsername(username);
    },

    async getUserByEmail(email) {
        return UserModel.findByEmail(email);
    },

    async promoteToOrganiser(userId) {
        return UserModel.update(userId, { role: "organiser" });
    },

    async deleteUser(userId) {
        return UserModel.delete(userId);
    },

    async getUsersWithRoles() {
        const users = await UserModel.list();
        return users.map((u) => ({
            id: u._id,
            username: u.username,
            email: u.email,
            role: u.role,
            isOrganiser: u.role === "organiser",
        }));
    },
};
