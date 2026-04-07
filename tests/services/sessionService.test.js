import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

const mockSessionModel = {
    listByCourse: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
};

const mockCourseModel = {
    update: jest.fn(),
    delete: jest.fn(),
};

jest.unstable_mockModule("../../models/sessionModel.js", () => ({ SessionModel: mockSessionModel }));
jest.unstable_mockModule("../../models/courseModel.js", () => ({ CourseModel: mockCourseModel }));
jest.unstable_mockModule("../../utils/dateFormatter.js", () => ({ fmtDate: jest.fn(() => "formatted") }));

let SessionService;

beforeAll(async () => {
    ({ SessionService } = await import("../../services/sessionService.js"));
});

describe("SessionService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("creates session and syncs course sessionIds", async () => {
        mockSessionModel.create.mockResolvedValue({ _id: "s1" });
        mockSessionModel.listByCourse.mockResolvedValue([{ _id: "s1" }, { _id: "s2" }]);

        await SessionService.createSessionForCourse("c1", {
            startDateTime: "2026-01-01T10:00",
            endDateTime: "2026-01-01T11:00",
            capacity: "18",
            location: "Room A",
            description: "Morning class",
            price: "12.5",
        });

        expect(mockCourseModel.update).toHaveBeenCalledWith("c1", { sessionIds: ["s1", "s2"] });
    });

    it("throws NOT_FOUND when updating wrong course session", async () => {
        mockSessionModel.findById.mockResolvedValue({ _id: "s1", courseId: "other" });

        await expect(
            SessionService.updateSessionForCourse("c1", "s1", { capacity: "20" })
        ).rejects.toMatchObject({ code: "NOT_FOUND" });
    });

    it("formats session for admin", () => {
        const result = SessionService.formatSessionForAdmin({
            _id: "s1",
            startDateTime: "2026-01-01T10:00:00.000Z",
            endDateTime: "2026-01-01T11:00:00.000Z",
            capacity: 18,
            price: 10,
        }, "c1");

        expect(result).toEqual(expect.objectContaining({
            _id: "s1",
            courseId: "c1",
            start: "formatted",
            end: "formatted",
            priceDisplay: "£10.00",
        }));
    });
});
