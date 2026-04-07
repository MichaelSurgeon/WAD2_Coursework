import { jest, describe, it, expect, beforeAll, beforeEach, afterEach } from "@jest/globals";

const mockUserModel = {
    findByUsername: jest.fn(),
    create: jest.fn(),
};

const mockJwtSign = jest.fn(() => "mock-token");
const mockBcryptCompare = jest.fn();

jest.unstable_mockModule("../../models/userModel.js", () => ({
    UserModel: mockUserModel,
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
    default: {
        sign: mockJwtSign,
    },
}));

jest.unstable_mockModule("bcrypt", () => ({
    default: {
        compare: mockBcryptCompare,
    },
}));

let AuthService;

beforeAll(async () => {
    ({ AuthService } = await import("../../services/authService.js"));
});

describe("AuthService", () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalSecret = process.env.ACCESS_TOKEN_SECRET;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.ACCESS_TOKEN_SECRET = "test-secret";
    });

    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv;
        process.env.ACCESS_TOKEN_SECRET = originalSecret;
    });

    it("returns null when user is not found during login", async () => {
        mockUserModel.findByUsername.mockResolvedValue(null);

        const result = await AuthService.validateLogin("alice", "password123");

        expect(result).toBeNull();
        expect(mockBcryptCompare).not.toHaveBeenCalled();
    });

    it("returns user when credentials are valid", async () => {
        const user = { _id: "u1", username: "alice", password: "hashed-pass" };
        mockUserModel.findByUsername.mockResolvedValue(user);
        mockBcryptCompare.mockResolvedValue(true);

        const result = await AuthService.validateLogin("alice", "password123");

        expect(result).toEqual(user);
        expect(mockBcryptCompare).toHaveBeenCalledWith("password123", "hashed-pass");
    });

    it("creates a student user", async () => {
        mockUserModel.create.mockResolvedValue({ _id: "u2" });

        await AuthService.createUser("alice", "alice@example.com", "password123");

        expect(mockUserModel.create).toHaveBeenCalledWith({
            username: "alice",
            email: "alice@example.com",
            password: "password123",
            role: "student",
        });
    });

    it("creates jwt token with expected payload and options", () => {
        const user = { _id: "u1", username: "alice", role: "organiser" };

        const token = AuthService.createToken(user);

        expect(token).toBe("mock-token");
        expect(mockJwtSign).toHaveBeenCalledWith(
            { _id: "u1", username: "alice", role: "organiser" },
            "test-secret",
            { expiresIn: "1d" }
        );
    });

    it("sets secure cookie flag only in production", () => {
        process.env.NODE_ENV = "production";
        expect(AuthService.getTokenOptions().secure).toBe(true);

        process.env.NODE_ENV = "development";
        expect(AuthService.getTokenOptions().secure).toBe(false);
    });
});
