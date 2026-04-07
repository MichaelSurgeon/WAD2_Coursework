import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

const mockUserService = {
    getAllUsers: jest.fn(),
    deleteUser: jest.fn(),
};

const mockAuthService = {
    validateRegister: jest.fn(),
    createUser: jest.fn(),
};

const mockValidationService = {
    validateRegistration: jest.fn(),
};

const mockSendRenderError = jest.fn();

jest.unstable_mockModule("../../services/userService.js", () => ({
    UserService: mockUserService,
}));

jest.unstable_mockModule("../../services/authService.js", () => ({
    AuthService: mockAuthService,
}));

jest.unstable_mockModule("../../services/validationService.js", () => ({
    ValidationService: mockValidationService,
}));

jest.unstable_mockModule("../../helpers/errorHandlers.js", () => ({
    sendRenderError: mockSendRenderError,
}));

let listUsers;
let deleteUser;

beforeAll(async () => {
    const controller = await import("../../controllers/adminUsersController.js");
    listUsers = controller.listUsers;
    deleteUser = controller.deleteUser;
});

describe("adminUsersController", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { user: { _id: "u1", role: "organiser" }, params: {} };
        res = { render: jest.fn(), redirect: jest.fn() };
        next = jest.fn();
    });

    it("renders users and marks current user", async () => {
        mockUserService.getAllUsers.mockResolvedValue([
            { _id: "u1", username: "admin", email: "a@a.com", role: "organiser" },
            { _id: "u2", username: "bob", email: "b@b.com", role: "student" },
        ]);

        await listUsers(req, res, next);

        const payload = res.render.mock.calls[0][1];
        expect(payload.users[0].isCurrentUser).toBe(true);
        expect(payload.users[1].isCurrentUser).toBe(false);
    });

    it("blocks self delete", async () => {
        req.params.id = "u1";

        await deleteUser(req, res, next);

        expect(mockSendRenderError).toHaveBeenCalledWith(
            res,
            "You cannot delete your own account",
            403,
            expect.objectContaining({ title: "Cannot Delete" })
        );
    });
});
