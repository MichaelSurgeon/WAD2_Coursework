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

    async promoteToOrganiser(userId) {
        return UserModel.update(userId, { role: "organiser" });
    },

    async demoteToStudent(userId) {
        return UserModel.update(userId, { role: "student" });
    },

    async deleteUser(userId) {
        return UserModel.delete(userId);
    }
};
