import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

const mockAuthService = {
    validateLogin: jest.fn(),
    createToken: jest.fn(),
    getTokenOptions: jest.fn(),
};

const mockValidationService = {
    validateLogin: jest.fn(),
};

jest.unstable_mockModule("../../services/authService.js", () => ({
    AuthService: mockAuthService,
}));

jest.unstable_mockModule("../../services/validationService.js", () => ({
    ValidationService: mockValidationService,
}));

let loginHandler;
let logout;

beforeAll(async () => {
    const controller = await import("../../controllers/authController.js");
    loginHandler = controller.loginHandler;
    logout = controller.logout;
});

describe("authController", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            body: {
                username: "alice",
                password: "password123",
            },
        };

        res = {
            render: jest.fn(),
            cookie: jest.fn(),
            redirect: jest.fn(),
            clearCookie: jest.fn(),
        };

        next = jest.fn();
    });

    it("renders first validation error on login", async () => {
        mockValidationService.validateLogin.mockReturnValue(["Username is required"]);

        await loginHandler(req, res, next);

        expect(res.render).toHaveBeenCalledWith("pages/auth/login", {
            title: "Login",
            error: "Username is required",
            username: "alice",
        });
        expect(mockAuthService.validateLogin).not.toHaveBeenCalled();
    });

    it("renders invalid credentials when auth fails", async () => {
        mockValidationService.validateLogin.mockReturnValue(null);
        mockAuthService.validateLogin.mockResolvedValue(null);

        await loginHandler(req, res, next);

        expect(res.render).toHaveBeenCalledWith("pages/auth/login", {
            title: "Login",
            error: "Invalid credentials",
            username: "alice",
        });
    });

    it("sets jwt cookie and redirects on successful login", async () => {
        const user = { _id: "u1", username: "alice", role: "student" };

        mockValidationService.validateLogin.mockReturnValue(null);
        mockAuthService.validateLogin.mockResolvedValue(user);
        mockAuthService.createToken.mockReturnValue("signed-token");
        mockAuthService.getTokenOptions.mockReturnValue({ httpOnly: true });

        await loginHandler(req, res, next);

        expect(res.cookie).toHaveBeenCalledWith("jwt", "signed-token", { httpOnly: true });
        expect(res.redirect).toHaveBeenCalledWith("/");
    });

    it("clears jwt cookie on logout", () => {
        logout(req, res, next);

        expect(res.clearCookie).toHaveBeenCalledWith("jwt");
        expect(res.redirect).toHaveBeenCalledWith("/login");
    });
});
