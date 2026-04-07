import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

const mockCourseService = {
    getCoursesPaginated: jest.fn(),
    getCourseForEdit: jest.fn(),
};

const mockSessionService = {
    listByCourse: jest.fn(),
    formatSessionsForAdmin: jest.fn(),
};

const mockValidationService = {
    validateCourse: jest.fn(),
    validateSession: jest.fn(),
};

const mockSendRenderError = jest.fn();

jest.unstable_mockModule("../../services/courseService.js", () => ({
    CourseService: mockCourseService,
}));

jest.unstable_mockModule("../../services/sessionService.js", () => ({
    SessionService: mockSessionService,
}));

jest.unstable_mockModule("../../services/validationService.js", () => ({
    ValidationService: mockValidationService,
}));

jest.unstable_mockModule("../../helpers/errorHandlers.js", () => ({
    sendRenderError: mockSendRenderError,
}));

jest.unstable_mockModule("../../utils/dateFormatter.js", () => ({
    fmtDateOnly: jest.fn((d) => d || ""),
}));

let listCourses;
let showEditCoursePage;

beforeAll(async () => {
    const controller = await import("../../controllers/adminCoursesController.js");
    listCourses = controller.listCourses;
    showEditCoursePage = controller.showEditCoursePage;
});

describe("adminCoursesController", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { user: { _id: "u1" }, query: {}, params: { id: "c1" } };
        res = { render: jest.fn(), redirect: jest.fn() };
        next = jest.fn();
    });

    it("renders paginated course list", async () => {
        mockCourseService.getCoursesPaginated.mockResolvedValue({
            items: [{ _id: "c1", title: "Course A" }],
            pagination: { page: 1, totalPages: 1 },
        });

        await listCourses(req, res, next);

        expect(res.render).toHaveBeenCalledWith("pages/admin/courses", expect.objectContaining({
            title: "Manage Courses",
            courses: [{ _id: "c1", title: "Course A" }],
        }));
    });

    it("renders not found when editing missing course", async () => {
        mockCourseService.getCourseForEdit.mockResolvedValue(null);

        await showEditCoursePage(req, res, next);

        expect(mockSendRenderError).toHaveBeenCalledWith(res, "Course not found");
    });
});
