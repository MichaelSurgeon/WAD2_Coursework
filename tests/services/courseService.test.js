import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockCourseModel = {
    getPaginatedCourses: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
};

const mockSessionModel = {
    listByCourse: jest.fn(),
};

const mockBookingModel = {
    findByCourse: jest.fn(),
};

const mockUserModel = {
    findByIds: jest.fn(),
};

jest.unstable_mockModule("../../models/courseModel.js", () => ({ CourseModel: mockCourseModel }));
jest.unstable_mockModule("../../models/sessionModel.js", () => ({ SessionModel: mockSessionModel }));
jest.unstable_mockModule("../../models/bookingModel.js", () => ({ BookingModel: mockBookingModel }));
jest.unstable_mockModule("../../models/userModel.js", () => ({ UserModel: mockUserModel }));
jest.unstable_mockModule("../../utils/dateFormatter.js", () => ({
    fmtDate: jest.fn(() => "formatted"),
    fmtDateOnly: jest.fn(() => "formatted-date"),
    fmtDateForInput: jest.fn(() => "2024-01-01"),
}));

const { CourseService } = await import("../../services/courseService.js");

describe("courseService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("formats paginated courses", async () => {
        mockCourseModel.getPaginatedCourses.mockResolvedValue({
            items: [{ _id: "c1", title: "Course", type: "WEEKLY_BLOCK", level: "beginner", sessionIds: ["s1"], allowDropIn: false }],
            pagination: { page: 1, totalPages: 1 },
        });

        const result = await CourseService.getCoursesPaginated("1", "10");

        expect(result.items[0]).toEqual(expect.objectContaining({ _id: "c1", sessionsCount: 1 }));
    });

    it("returns null when getCourseById cannot find course", async () => {
        mockCourseModel.findById.mockResolvedValue(null);

        await expect(CourseService.getCourseById("missing")).resolves.toBeNull();
    });

    it("builds class list participants", async () => {
        mockCourseModel.findById.mockResolvedValue({ _id: "c1", title: "Course" });
        mockBookingModel.findByCourse.mockResolvedValue([{ userId: "u1" }]);
        mockUserModel.findByIds.mockResolvedValue([{ _id: "u1", username: "john", email: "j@test.com" }]);

        const result = await CourseService.getClassListByCourseId("c1");

        expect(result.count).toBe(1);
        expect(result.participants[0]).toEqual({ username: "john", email: "j@test.com" });
    });
});
