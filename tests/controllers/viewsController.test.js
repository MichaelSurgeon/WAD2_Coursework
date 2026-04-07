import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

const mockCourseService = {
    getFeaturedCourses: jest.fn(),
    getCourseById: jest.fn(),
};

const mockBookCourseForUser = jest.fn();
const mockBookSessionForUser = jest.fn();
const mockGetBookingById = jest.fn();
const mockSendRenderError = jest.fn();

jest.unstable_mockModule("../../services/courseService.js", () => ({
    CourseService: mockCourseService,
}));

jest.unstable_mockModule("../../services/bookingService.js", () => ({
    bookCourseForUser: mockBookCourseForUser,
    bookSessionForUser: mockBookSessionForUser,
    getBookingById: mockGetBookingById,
}));

jest.unstable_mockModule("../../helpers/errorHandlers.js", () => ({
    sendRenderError: mockSendRenderError,
}));

jest.unstable_mockModule("../../utils/dateFormatter.js", () => ({
    fmtDate: jest.fn(() => "01 Jan 2026, 10:00"),
}));

let homePage;
let courseDetailPage;
let postBookSession;

beforeAll(async () => {
    const controller = await import("../../controllers/viewsController.js");
    homePage = controller.homePage;
    courseDetailPage = controller.courseDetailPage;
    postBookSession = controller.postBookSession;
});

describe("viewsController", () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
        jest.clearAllMocks();
        req = {
            user: { _id: "u1" },
            params: { id: "c1" },
            query: {},
        };
        res = { render: jest.fn(), redirect: jest.fn() };
        next = jest.fn();
    });

    it("renders home with featured courses", async () => {
        mockCourseService.getFeaturedCourses.mockResolvedValue([{ _id: "c1", title: "Flow" }]);

        await homePage(req, res, next);

        expect(res.render).toHaveBeenCalledWith("pages/home", expect.objectContaining({
            courses: [{ _id: "c1", title: "Flow" }],
        }));
    });

    it("renders not found for missing course detail", async () => {
        mockCourseService.getCourseById.mockResolvedValue(null);

        await courseDetailPage(req, res, next);

        expect(mockSendRenderError).toHaveBeenCalledWith(res, "Course not found");
    });

    it("redirects after booking a session", async () => {
        req.params.id = "s1";
        mockBookSessionForUser.mockResolvedValue({ _id: "b1", status: "CONFIRMED" });

        await postBookSession(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith("/bookings/b1?status=CONFIRMED");
    });
});
