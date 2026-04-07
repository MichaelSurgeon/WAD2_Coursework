import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

const mockCourseModel = { findById: jest.fn() };
const mockSessionModel = { listByCourse: jest.fn(), findById: jest.fn(), incrementBookedCount: jest.fn() };
const mockBookingModel = {
    findByUserAndCourse: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
};

jest.unstable_mockModule("../../models/courseModel.js", () => ({ CourseModel: mockCourseModel }));
jest.unstable_mockModule("../../models/sessionModel.js", () => ({ SessionModel: mockSessionModel }));
jest.unstable_mockModule("../../models/bookingModel.js", () => ({ BookingModel: mockBookingModel }));

let bookCourseForUser;
let bookSessionForUser;
let getBookingById;

beforeAll(async () => {
    ({ bookCourseForUser, bookSessionForUser, getBookingById } = await import("../../services/bookingService.js"));
});

describe("bookingService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("books a full course", async () => {
        mockCourseModel.findById.mockResolvedValue({ _id: "c1", allowDropIn: true, type: "WEEKLY_BLOCK" });
        mockBookingModel.findByUserAndCourse.mockResolvedValue(null);
        mockSessionModel.listByCourse.mockResolvedValue([{ _id: "s1" }, { _id: "s2" }]);
        mockBookingModel.create.mockResolvedValue({ _id: "b1" });

        await bookCourseForUser("u1", "c1");

        expect(mockSessionModel.incrementBookedCount).toHaveBeenCalledTimes(2);
        expect(mockBookingModel.create).toHaveBeenCalledWith(expect.objectContaining({
            userId: "u1",
            courseId: "c1",
            type: "COURSE",
            sessionIds: ["s1", "s2"],
        }));
    });

    it("blocks session booking when drop-in not allowed", async () => {
        mockSessionModel.findById.mockResolvedValue({ _id: "s1", courseId: "c1" });
        mockBookingModel.findByUserAndCourse.mockResolvedValue(null);
        mockCourseModel.findById.mockResolvedValue({ _id: "c1", allowDropIn: false, type: "WEEKLY_BLOCK" });

        await expect(bookSessionForUser("u1", "s1")).rejects.toThrow("Drop-in not allowed for this course");
    });

    it("returns booking by id", async () => {
        mockBookingModel.findById.mockResolvedValue({ _id: "b1" });
        await expect(getBookingById("b1")).resolves.toEqual({ _id: "b1" });
    });
});
