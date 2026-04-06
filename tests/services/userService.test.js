import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockUserModel = {
    list: jest.fn(),
    getUserCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

jest.unstable_mockModule("../../models/userModel.js", () => ({ UserModel: mockUserModel }));

const { UserService } = await import("../../services/userService.js");

describe("userService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("maps all users for admin display", async () => {
        mockUserModel.list.mockResolvedValue([{ _id: "u1", username: "john", email: "j@test.com", role: "student" }]);

        const users = await UserService.getAllUsers();

        expect(users).toEqual([{ id: "u1", username: "john", email: "j@test.com", role: "student" }]);
    });

    it("delegates role changes and delete", async () => {
        await UserService.promoteToOrganiser("u1");
        await UserService.demoteToStudent("u1");
        await UserService.deleteUser("u1");

        expect(mockUserModel.update).toHaveBeenCalledWith("u1", { role: "organiser" });
        expect(mockUserModel.update).toHaveBeenCalledWith("u1", { role: "student" });
        expect(mockUserModel.delete).toHaveBeenCalledWith("u1");
    });
});
