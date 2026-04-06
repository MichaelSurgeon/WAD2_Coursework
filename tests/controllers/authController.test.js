import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockAuthService = {
    validateLogin: jest.fn(),
    validateRegister: jest.fn(),
    createUser: jest.fn(),
    createToken: jest.fn(),
    getTokenOptions: jest.fn(),
};

const mockValidationService = {
    validateLogin: jest.fn(),
    validateRegistration: jest.fn(),
};

jest.unstable_mockModule("../../services/authService.js", () => ({
    AuthService: mockAuthService,
}));

jest.unstable_mockModule("../../services/validationService.js", () => ({
    ValidationService: mockValidationService,
}));

const {
    loginPage,
    loginHandler,
    registerPage,
    registerHandler,
    logoutConfirmationPage,
    logout,
} = await import("../../controllers/authController.js");

const makeRes = () => ({
    render: jest.fn(),
    cookie: jest.fn(),
    redirect: jest.fn(),
    clearCookie: jest.fn(),
});

const validBody = {
    username: "user",
    email: "user@example.com",
    password: "password123",
    passwordConfirm: "password123",
};

describe("authController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders static auth pages", () => {
        const req = {};
        const res = makeRes();
        const next = jest.fn();

        loginPage(req, res, next);
        registerPage(req, res, next);
        logoutConfirmationPage(req, res, next);

        expect(res.render).toHaveBeenNthCalledWith(1, "pages/auth/login", { title: "Login" });
        expect(res.render).toHaveBeenNthCalledWith(2, "pages/auth/register", { title: "Register" });
        expect(res.render).toHaveBeenNthCalledWith(3, "pages/logout-confirmation", {
            title: "Logout Confirmation",
        });
        expect(next).not.toHaveBeenCalled();
    });

    describe("loginHandler", () => {
        it("renders login with validation error", async () => {
            const req = { body: { username: "", password: "" } };
            const res = makeRes();
            const next = jest.fn();

            mockValidationService.validateLogin.mockReturnValue(["Username is required"]);

            await loginHandler(req, res, next);

            expect(res.render).toHaveBeenCalledWith("pages/auth/login", {
                title: "Login",
                error: "Username is required",
                username: "",
            });
            expect(mockAuthService.validateLogin).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it("renders login with invalid credentials", async () => {
            const req = { body: { username: "user", password: "wrong" } };
            const res = makeRes();
            const next = jest.fn();

            mockValidationService.validateLogin.mockReturnValue(null);
            mockAuthService.validateLogin.mockResolvedValue(null);

            await loginHandler(req, res, next);

            expect(res.render).toHaveBeenCalledWith("pages/auth/login", {
                title: "Login",
                error: "Invalid credentials",
                username: "user",
            });
            expect(res.redirect).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it("sets jwt cookie and redirects on success", async () => {
            const req = { body: { username: "user", password: "password123" } };
            const res = makeRes();
            const next = jest.fn();

            const user = { _id: "u1", username: "user", role: "student" };
            const cookieOptions = { httpOnly: true, sameSite: "strict" };

            mockValidationService.validateLogin.mockReturnValue(null);
            mockAuthService.validateLogin.mockResolvedValue(user);
            mockAuthService.createToken.mockReturnValue("jwt-token");
            mockAuthService.getTokenOptions.mockReturnValue(cookieOptions);

            await loginHandler(req, res, next);

            expect(res.cookie).toHaveBeenCalledWith("jwt", "jwt-token", cookieOptions);
            expect(res.redirect).toHaveBeenCalledWith("/");
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("registerHandler", () => {
        it("renders register with validation error", async () => {
            const req = { body: { ...validBody, username: "" } };
            const res = makeRes();
            const next = jest.fn();

            mockValidationService.validateRegistration.mockReturnValue(["Username is required"]);

            await registerHandler(req, res, next);

            expect(res.render).toHaveBeenCalledWith("pages/auth/register", {
                title: "Register",
                error: "Username is required",
                username: "",
                email: "user@example.com",
            });
            expect(mockAuthService.validateRegister).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it("renders register with auth error", async () => {
            const req = { body: validBody };
            const res = makeRes();
            const next = jest.fn();

            mockValidationService.validateRegistration.mockReturnValue(null);
            mockAuthService.validateRegister.mockResolvedValue(["Username already taken"]);

            await registerHandler(req, res, next);

            expect(res.render).toHaveBeenCalledWith("pages/auth/register", {
                title: "Register",
                error: "Username already taken",
                username: "user",
                email: "user@example.com",
            });
            expect(mockAuthService.createUser).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
        });

        it("creates user, sets cookie and redirects on success", async () => {
            const req = { body: validBody };
            const res = makeRes();
            const next = jest.fn();

            const newUser = { _id: "u1", username: "user", role: "student" };
            const cookieOptions = { httpOnly: true, sameSite: "strict" };

            mockValidationService.validateRegistration.mockReturnValue(null);
            mockAuthService.validateRegister.mockResolvedValue(null);
            mockAuthService.createUser.mockResolvedValue(newUser);
            mockAuthService.createToken.mockReturnValue("jwt-token");
            mockAuthService.getTokenOptions.mockReturnValue(cookieOptions);

            await registerHandler(req, res, next);

            expect(mockAuthService.createUser).toHaveBeenCalledWith("user", "user@example.com", "password123");
            expect(res.cookie).toHaveBeenCalledWith("jwt", "jwt-token", cookieOptions);
            expect(res.redirect).toHaveBeenCalledWith("/");
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe("logout", () => {
        it("clears cookie and redirects", () => {
            const req = {};
            const res = makeRes();
            const next = jest.fn();

            logout(req, res, next);

            expect(res.clearCookie).toHaveBeenCalledWith("jwt");
            expect(res.redirect).toHaveBeenCalledWith("/login");
            expect(next).not.toHaveBeenCalled();
        });
    });
});
