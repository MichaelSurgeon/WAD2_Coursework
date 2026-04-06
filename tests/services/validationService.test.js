import { describe, expect, it } from "@jest/globals";
import { ValidationService } from "../../services/validationService.js";

describe("validationService", () => {
    it("validates login and registration", () => {
        const loginErrors = ValidationService.validateLogin({ username: "", password: "" });
        const registerErrors = ValidationService.validateRegistration({
            username: "ab",
            email: "bad",
            password: "short",
            passwordConfirm: "different",
        });

        expect(loginErrors).toEqual(expect.arrayContaining(["Username is required", "Password is required"]));
        expect(registerErrors).toEqual(expect.arrayContaining([
            "Username must be at least 3 characters",
            "Invalid email format",
            "Password must be at least 8 characters",
            "Passwords do not match",
        ]));
    });

    it("validates course and session date/capacity constraints", () => {
        const courseErrors = ValidationService.validateCourse({
            title: "",
            description: "",
            level: "invalid",
            type: "invalid",
            startDate: "2024-01-02",
            endDate: "2024-01-01",
            price: -1,
        });

        const sessionErrors = ValidationService.validateSession({
            startDateTime: "2024-01-02T10:00:00.000Z",
            endDateTime: "2024-01-02T09:00:00.000Z",
            capacity: "0",
        });

        expect(courseErrors).toEqual(expect.arrayContaining([
            "Course title is required",
            "Description is required",
            "Invalid level",
            "Invalid course type",
            "Price cannot be negative",
            "End date must be after start date",
        ]));

        expect(sessionErrors).toEqual(expect.arrayContaining([
            "Session capacity must be at least 1",
            "End date must be after start date",
        ]));
    });
});
