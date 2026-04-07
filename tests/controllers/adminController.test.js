// I Had to use unstable_mockModule and await import as jest.mock doesn't work with ES modules, only commonJS. 
// See https://jestjs.io/docs/ecmascript-modules#mocking-modules
// Same throughout the tests, doing it this way means the mocks are registered before imports. 
// Old comonJS would call the mocks after statch imports, which is too late for ES modules to resolve the dependency mocks.

import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

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

let adminDashboard;

beforeAll(async () => {
    ({ adminDashboard } = await import("../../controllers/adminController.js"));
});

describe("adminController", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { user: { _id: "u1", role: "organiser" } };
        res = { render: jest.fn() };
        next = jest.fn();
    });

    it("renders dashboard counts", async () => {
        mockCourseService.getCourseCount.mockResolvedValue(5);
        mockUserService.getTotalUserCount.mockResolvedValue(8);

        await adminDashboard(req, res, next);

        expect(res.render).toHaveBeenCalledWith("pages/admin/dashboard", {
            title: "Admin Dashboard",
            user: req.user,
            coursesCount: 5,
            usersCount: 8,
        });
    });
});
