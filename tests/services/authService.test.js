import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockUserModel = {
    findByUsername: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
};

const mockCompare = jest.fn();
const mockSign = jest.fn();

jest.unstable_mockModule("../../models/userModel.js", () => ({ UserModel: mockUserModel }));
jest.unstable_mockModule("bcrypt", () => ({ default: { compare: mockCompare } }));
jest.unstable_mockModule("jsonwebtoken", () => ({ default: { sign: mockSign } }));

const { AuthService } = await import("../../services/authService.js");

describe("authService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("validates login with password check", async () => {
        mockUserModel.findByUsername.mockResolvedValue({ _id: "u1", username: "john", password: "hash", role: "student" });
        mockCompare.mockResolvedValue(true);

        const result = await AuthService.validateLogin("john", "password123");

        expect(result).toEqual(expect.objectContaining({ _id: "u1" }));
        expect(mockCompare).toHaveBeenCalledWith("password123", "hash");
    });

    it("returns registration errors for duplicates and short password", async () => {
        mockUserModel.findByUsername.mockResolvedValue({ _id: "u1" });
        mockUserModel.findByEmail.mockResolvedValue({ _id: "u2" });

        const errors = await AuthService.validateRegister("john", "j@test.com", "short", "short");

        expect(errors).toEqual(expect.arrayContaining([
            "Password must be at least 8 characters",
            "Username already taken",
            "Email already registered",
        ]));
    });

    it("creates token and cookie options", () => {
        process.env.ACCESS_TOKEN_SECRET = "test-secret";
        mockSign.mockReturnValue("jwt-token");

        const token = AuthService.createToken({ _id: "u1", username: "john", role: "student" });
        const options = AuthService.getTokenOptions();

        expect(token).toBe("jwt-token");
        expect(mockSign).toHaveBeenCalled();
        expect(options.httpOnly).toBe(true);
        expect(options.sameSite).toBe("strict");
    });
});
