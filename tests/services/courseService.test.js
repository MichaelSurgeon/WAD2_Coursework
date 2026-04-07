import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

const mockCourseModel = {
    getPaginatedCourses: jest.fn(),
    findById: jest.fn(),
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
    fmtDate: jest.fn(() => "formatted-date"),
    fmtDateOnly: jest.fn(() => "formatted-day"),
    fmtDateForInput: jest.fn(() => "2026-01-01"),
}));

let CourseService;

beforeAll(async () => {
    ({ CourseService } = await import("../../services/courseService.js"));
});

describe("CourseService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("maps paginated courses", async () => {
        mockCourseModel.getPaginatedCourses.mockResolvedValue({
            items: [{ _id: "c1", title: "Flow", level: "beginner", type: "WEEKLY_BLOCK", description: "d", allowDropIn: true, startDate: "2026-01-01", endDate: "2026-01-08", sessionIds: ["s1"] }],
            pagination: { page: 1, totalPages: 1 },
        });

        const result = await CourseService.getCoursesPaginated(1, 6, {});

        expect(result.items[0]).toEqual(expect.objectContaining({
            _id: "c1",
            title: "Flow",
            sessionsCount: 1,
        }));
    });

    it("returns null when class list course is missing", async () => {
        mockCourseModel.findById.mockResolvedValue(null);

        await expect(CourseService.getClassListByCourseId("missing")).resolves.toBeNull();
    });

    it("builds class list participants", async () => {
        mockCourseModel.findById.mockResolvedValue({ _id: "c1", title: "Flow" });
        mockBookingModel.findByCourse.mockResolvedValue([{ userId: "u1" }]);
        mockUserModel.findByIds.mockResolvedValue([{ _id: "u1", username: "alice", email: "alice@example.com" }]);

        const result = await CourseService.getClassListByCourseId("c1");

        expect(result).toEqual(expect.objectContaining({
            count: 1,
            participants: [{ username: "alice", email: "alice@example.com" }],
        }));
    });
});
