import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

const mockCourseService = {
    getCoursesPaginated: jest.fn(),
};

jest.unstable_mockModule("../../services/courseService.js", () => ({
    CourseService: mockCourseService,
}));

let coursesListPage;

beforeAll(async () => {
    ({ coursesListPage } = await import("../../controllers/coursesListController.js"));
});

describe("coursesListController", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            user: { _id: "u1" },
            query: {
                q: "  flow ",
                level: "beginner",
                type: "WEEKLY_BLOCK",
                page: "2",
                pageSize: "6",
            },
        };
        res = { render: jest.fn() };
        next = jest.fn();
    });

    it("renders courses with filters", async () => {
        mockCourseService.getCoursesPaginated.mockResolvedValue({
            items: [{ _id: "c1", title: "Flow" }],
            pagination: { page: 2, totalPages: 3 },
        });

        await coursesListPage(req, res, next);

        expect(mockCourseService.getCoursesPaginated).toHaveBeenCalledWith("2", "6", {
            q: "flow",
            level: "beginner",
            type: "WEEKLY_BLOCK",
        });

        expect(res.render).toHaveBeenCalledWith(
            "pages/courses",
            expect.objectContaining({
                title: "Courses",
                courses: [{ _id: "c1", title: "Flow" }],
            })
        );
    });
});
