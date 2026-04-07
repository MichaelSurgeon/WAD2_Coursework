import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

const mockUserModel = {
    list: jest.fn(),
    getUserCount: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

jest.unstable_mockModule("../../models/userModel.js", () => ({
    UserModel: mockUserModel,
}));

let UserService;

beforeAll(async () => {
    ({ UserService } = await import("../../services/userService.js"));
});

describe("UserService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("maps users for admin list", async () => {
        mockUserModel.list.mockResolvedValue([{ _id: "u1", username: "a", email: "a@a.com", role: "student", password: "hidden" }]);

        const result = await UserService.getAllUsers();

        expect(result).toEqual([{ _id: "u1", username: "a", email: "a@a.com", role: "student" }]);
    });

    it("promotes and demotes users", async () => {
        await UserService.promoteToOrganiser("u1");
        await UserService.demoteToStudent("u2");

        expect(mockUserModel.update).toHaveBeenNthCalledWith(1, "u1", { role: "organiser" });
        expect(mockUserModel.update).toHaveBeenNthCalledWith(2, "u2", { role: "student" });
    });
});
