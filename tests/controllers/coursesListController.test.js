import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockCourseService = {
    getCoursesPaginated: jest.fn(),
};

jest.unstable_mockModule("../../services/courseService.js", () => ({
    CourseService: mockCourseService,
}));

const { coursesListPage } = await import("../../controllers/coursesListController.js");

const makeRes = () => ({
    render: jest.fn(),
});

describe("coursesListController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders courses with paginated results", async () => {
        const req = { query: { page: "2", pageSize: "4" }, user: { _id: "u1" } };
        const res = makeRes();
        const next = jest.fn();

        const items = [{ _id: "c1", title: "Yoga 1" }];
        const pagination = { page: 2, totalPages: 5, hasPrev: true, hasNext: true };
        mockCourseService.getCoursesPaginated.mockResolvedValue({ items, pagination });

        await coursesListPage(req, res, next);

        expect(mockCourseService.getCoursesPaginated).toHaveBeenCalledWith("2", "4");
        expect(res.render).toHaveBeenCalledWith("pages/courses", {
            title: "Courses",
            user: req.user,
            courses: items,
            pagination,
        });
        expect(next).not.toHaveBeenCalled();
    });
});
