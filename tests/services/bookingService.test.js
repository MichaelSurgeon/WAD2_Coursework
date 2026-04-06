import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockCourseModel = {
    findById: jest.fn(),
};

const mockSessionModel = {
    listByCourse: jest.fn(),
    incrementBookedCount: jest.fn(),
    findById: jest.fn(),
};

const mockBookingModel = {
    findByUserAndCourse: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
};

jest.unstable_mockModule("../../models/courseModel.js", () => ({ CourseModel: mockCourseModel }));
jest.unstable_mockModule("../../models/sessionModel.js", () => ({ SessionModel: mockSessionModel }));
jest.unstable_mockModule("../../models/bookingModel.js", () => ({ BookingModel: mockBookingModel }));

const { bookCourseForUser, bookSessionForUser, getBookingById } = await import("../../services/bookingService.js");

describe("bookingService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("creates a course booking and increments sessions", async () => {
        mockCourseModel.findById.mockResolvedValue({ _id: "c1" });
        mockBookingModel.findByUserAndCourse.mockResolvedValue(null);
        mockSessionModel.listByCourse.mockResolvedValue([{ _id: "s1" }, { _id: "s2" }]);
        mockBookingModel.create.mockResolvedValue({ _id: "b1" });

        const result = await bookCourseForUser("u1", "c1");

        expect(mockSessionModel.incrementBookedCount).toHaveBeenCalledTimes(2);
        expect(result).toEqual({ _id: "b1" });
    });

    it("blocks drop-in booking when not allowed", async () => {
        mockSessionModel.findById.mockResolvedValue({ _id: "s1", courseId: "c1" });
        mockBookingModel.findByUserAndCourse.mockResolvedValue(null);
        mockCourseModel.findById.mockResolvedValue({ _id: "c1", allowDropIn: false, type: "WEEKLY_BLOCK" });

        await expect(bookSessionForUser("u1", "s1")).rejects.toThrow("Drop-in not allowed for this course");
    });

    it("returns booking by id and errors if missing", async () => {
        mockBookingModel.findById.mockResolvedValueOnce({ _id: "b1" });
        await expect(getBookingById("b1")).resolves.toEqual({ _id: "b1" });

        mockBookingModel.findById.mockResolvedValueOnce(null);
        await expect(getBookingById("bad")).rejects.toThrow("Booking not found");
    });
});
