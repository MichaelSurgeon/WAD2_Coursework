import { describe, it, expect } from "@jest/globals";
import { ValidationService } from "../../services/validationService.js";

describe("ValidationService", () => {
    it("returns null for valid login payload", () => {
        const result = ValidationService.validateLogin({ username: "alice", password: "password123" });
        expect(result).toBeNull();
    });

    it("returns errors for invalid registration payload", () => {
        const result = ValidationService.validateRegistration({
            username: "ab",
            email: "invalid-email",
            password: "123",
            passwordConfirm: "456",
        });

        expect(result).toEqual(expect.arrayContaining([
            "Username must be at least 3 characters",
            "Invalid email format",
            "Password must be at least 8 characters",
            "Passwords do not match",
        ]));
    });

    it("validates course date range", () => {
        const result = ValidationService.validateCourse({
            title: "Flow",
            description: "Desc",
            level: "beginner",
            type: "WEEKLY_BLOCK",
            startDate: "2026-04-10",
            endDate: "2026-04-09",
        });

        expect(result).toContain("End date must be after start date");
    });
});
