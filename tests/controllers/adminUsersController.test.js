import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockUserService = {
    getAllUsers: jest.fn(),
    promoteToOrganiser: jest.fn(),
    demoteToStudent: jest.fn(),
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

jest.unstable_mockModule("../../services/userService.js", () => ({ UserService: mockUserService }));
jest.unstable_mockModule("../../services/authService.js", () => ({ AuthService: mockAuthService }));
jest.unstable_mockModule("../../services/validationService.js", () => ({ ValidationService: mockValidationService }));
jest.unstable_mockModule("../../helpers/errorHandlers.js", () => ({ sendRenderError: mockSendRenderError }));

const {
    listUsers,
    showAddUserPage,
    postAddUser,
    promoteUserToOrganiser,
    demoteUserToStudent,
    deleteUser,
} = await import("../../controllers/adminUsersController.js");

const makeRes = () => ({
    render: jest.fn(),
    redirect: jest.fn(),
});

describe("adminUsersController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders user list", async () => {
        const req = { user: { _id: "u1" } };
        const res = makeRes();
        const next = jest.fn();

        mockUserService.getAllUsers.mockResolvedValue([
            { _id: "u1", username: "me", email: "me@test.com", role: "organiser" },
            { _id: "u2", username: "other", email: "o@test.com", role: "student" },
        ]);

        await listUsers(req, res, next);

        expect(res.render).toHaveBeenCalled();
        const renderArg = res.render.mock.calls[0][1];
        expect(renderArg.users[0].isCurrentUser).toBe(true);
        expect(renderArg.users[1].isCurrentUser).toBe(false);
    });

    it("renders add user page", () => {
        const req = { user: { _id: "u1" } };
        const res = makeRes();
        const next = jest.fn();

        showAddUserPage(req, res, next);

        expect(res.render).toHaveBeenCalledWith("pages/admin/user-form", {
            title: "Add User",
            user: req.user,
        });
    });

    it("renders validation error on add user", async () => {
        const req = { user: { _id: "u1" }, body: { username: "", email: "" } };
        const res = makeRes();
        const next = jest.fn();

        mockValidationService.validateRegistration.mockReturnValue(["Username is required"]);

        await postAddUser(req, res, next);

        expect(res.render).toHaveBeenCalledWith("pages/admin/user-form", expect.objectContaining({
            error: "Username is required",
        }));
    });

    it("creates user and redirects on valid input", async () => {
        const req = {
            user: { _id: "u1" },
            body: { username: "new", email: "n@test.com", password: "password123", passwordConfirm: "password123" },
        };
        const res = makeRes();
        const next = jest.fn();

        mockValidationService.validateRegistration.mockReturnValue(null);
        mockAuthService.validateRegister.mockResolvedValue(null);

        await postAddUser(req, res, next);

        expect(mockAuthService.createUser).toHaveBeenCalledWith("new", "n@test.com", "password123");
        expect(res.redirect).toHaveBeenCalledWith("/admin/users");
        expect(next).not.toHaveBeenCalled();
    });

    it("promotes and demotes users", async () => {
        const reqPromote = { params: { id: "u2" } };
        const reqDemote = { params: { id: "u2" } };
        const res = makeRes();
        const next = jest.fn();

        await promoteUserToOrganiser(reqPromote, res, next);
        await demoteUserToStudent(reqDemote, res, next);

        expect(mockUserService.promoteToOrganiser).toHaveBeenCalledWith("u2");
        expect(mockUserService.demoteToStudent).toHaveBeenCalledWith("u2");
        expect(res.redirect).toHaveBeenCalledWith("/admin/users");
    });

    it("blocks deleting the current user", async () => {
        const req = { params: { id: "u1" }, user: { _id: "u1" } };
        const res = makeRes();
        const next = jest.fn();

        await deleteUser(req, res, next);

        expect(mockSendRenderError).toHaveBeenCalled();
        expect(mockUserService.deleteUser).not.toHaveBeenCalled();
    });
});
