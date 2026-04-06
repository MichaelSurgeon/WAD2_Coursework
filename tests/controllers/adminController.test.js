import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockCourseService = {
    getCourseCount: jest.fn(),
};

const mockUserService = {
    getTotalUserCount: jest.fn(),
};

jest.unstable_mockModule("../../services/courseService.js", () => ({
    CourseService: mockCourseService,
}));

jest.unstable_mockModule("../../services/userService.js", () => ({
    UserService: mockUserService,
}));

const { adminDashboard } = await import("../../controllers/adminController.js");

const makeRes = () => ({ render: jest.fn() });

describe("adminController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders dashboard with course and user counts", async () => {
        const req = { user: { _id: "u1", role: "organiser" } };
        const res = makeRes();
        const next = jest.fn();

        mockCourseService.getCourseCount.mockResolvedValue(8);
        mockUserService.getTotalUserCount.mockResolvedValue(22);

        await adminDashboard(req, res, next);

        expect(res.render).toHaveBeenCalledWith("pages/admin/dashboard", {
            title: "Admin Dashboard",
            user: req.user,
            coursesCount: 8,
            usersCount: 22,
        });
        expect(next).not.toHaveBeenCalled();
    });
});
