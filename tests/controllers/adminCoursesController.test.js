import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockCourseService = {
    getCoursesPaginated: jest.fn(),
    getCourseForEdit: jest.fn(),
    getCourseById: jest.fn(),
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

jest.unstable_mockModule("../../services/courseService.js", () => ({ CourseService: mockCourseService }));
jest.unstable_mockModule("../../services/sessionService.js", () => ({ SessionService: mockSessionService }));
jest.unstable_mockModule("../../services/validationService.js", () => ({ ValidationService: mockValidationService }));
jest.unstable_mockModule("../../helpers/errorHandlers.js", () => ({ sendRenderError: mockSendRenderError }));
jest.unstable_mockModule("../../utils/dateFormatter.js", () => ({ fmtDateOnly: jest.fn(() => "2024-01-01") }));

const {
    listCourses,
    postAddCourse,
    showEditCoursePage,
    postAddSession
} = await import("../../controllers/adminCoursesController.js");

const makeRes = () => ({ render: jest.fn(), redirect: jest.fn() });

describe("adminCoursesController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders paginated courses", async () => {
        const req = { query: { page: "1", pageSize: "10" }, user: { _id: "u1" } };
        const res = makeRes();
        const next = jest.fn();

        mockCourseService.getCoursesPaginated.mockResolvedValue({
            items: [{ _id: "c1", title: "Course" }],
            pagination: { page: 1, totalPages: 1 },
        });

        await listCourses(req, res, next);

        expect(res.render).toHaveBeenCalledWith("pages/admin/courses", expect.objectContaining({ title: "Manage Courses" }));
        expect(next).not.toHaveBeenCalled();
    });

    it("renders validation errors when adding course", async () => {
        const req = { body: { title: "" }, user: { _id: "u1" } };
        const res = makeRes();
        const next = jest.fn();

        mockValidationService.validateCourse.mockReturnValue(["Course title is required"]);

        await postAddCourse(req, res, next);

        expect(res.render).toHaveBeenCalledWith("pages/admin/course-form", expect.objectContaining({
            errors: { list: ["Course title is required"] },
        }));
    });

    it("loads edit page and handles not-found", async () => {
        const req = { params: { id: "c1" }, user: { _id: "u1" } };
        const res = makeRes();
        const next = jest.fn();

        mockCourseService.getCourseForEdit.mockResolvedValueOnce({ _id: "c1", title: "Course", level: "beginner", type: "WEEKLY_BLOCK" });
        await showEditCoursePage(req, res, next);
        expect(res.render).toHaveBeenCalledWith("pages/admin/course-form", expect.objectContaining({ isEdit: true }));

        mockCourseService.getCourseForEdit.mockResolvedValueOnce(null);
        await showEditCoursePage(req, res, next);
        expect(mockSendRenderError).toHaveBeenCalledWith(res, "Course not found");
    });

    it("renders add session page with errors when session validation fails", async () => {
        const req = { params: { id: "c1" }, body: {}, user: { _id: "u1" } };
        const res = makeRes();
        const next = jest.fn();

        mockValidationService.validateSession.mockReturnValue(["Session start date and time is required"]);
        mockCourseService.getCourseById.mockResolvedValue({ _id: "c1", title: "Course", startDate: "2024-01-01", endDate: "2024-01-07" });
        mockSessionService.listByCourse.mockResolvedValue([{ _id: "s1" }]);
        mockSessionService.formatSessionsForAdmin.mockReturnValue([{ _id: "s1" }]);

        await postAddSession(req, res, next);

        expect(res.render).toHaveBeenCalledWith("pages/admin/course-sessions", expect.objectContaining({
            errors: { list: ["Session start date and time is required"] },
        }));
    });
});
