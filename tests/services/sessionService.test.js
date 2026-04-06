import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockSessionModel = {
    listByCourse: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
};

const mockCourseModel = {
    update: jest.fn(),
    delete: jest.fn(),
};

jest.unstable_mockModule("../../models/sessionModel.js", () => ({ SessionModel: mockSessionModel }));
jest.unstable_mockModule("../../models/courseModel.js", () => ({ CourseModel: mockCourseModel }));
jest.unstable_mockModule("../../utils/dateFormatter.js", () => ({ fmtDate: jest.fn(() => "formatted") }));

const { SessionService } = await import("../../services/sessionService.js");

describe("sessionService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("creates session and updates course sessionIds", async () => {
        mockSessionModel.create.mockResolvedValue({ _id: "s1" });
        mockSessionModel.listByCourse.mockResolvedValue([{ _id: "s1" }]);

        const result = await SessionService.createSessionForCourse("c1", {
            startDateTime: "2024-01-01T10:00:00.000Z",
            endDateTime: "2024-01-01T11:00:00.000Z",
            capacity: "10",
            location: "Room A",
        });

        expect(result).toEqual({ _id: "s1" });
        expect(mockCourseModel.update).toHaveBeenCalledWith("c1", { sessionIds: ["s1"] });
    });

    it("deletes course when removing last session", async () => {
        mockSessionModel.listByCourse.mockResolvedValueOnce([{ _id: "s1" }]);

        const result = await SessionService.deleteSessionFromCourse("c1", "s1");

        expect(mockSessionModel.delete).toHaveBeenCalledWith("s1");
        expect(mockCourseModel.delete).toHaveBeenCalledWith("c1");
        expect(result).toEqual({ courseDeleted: true });
    });

    it("formats sessions for admin", () => {
        const output = SessionService.formatSessionsForAdmin([{ _id: "s1", startDateTime: "x", capacity: 10 }], "c1");

        expect(output[0]).toEqual(expect.objectContaining({ _id: "s1", courseId: "c1" }));
    });
});
