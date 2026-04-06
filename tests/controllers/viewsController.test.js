import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockCourseService = {
    getFeaturedCourses: jest.fn(),
    getCourseById: jest.fn(),
};

const mockBookCourseForUser = jest.fn();
const mockBookSessionForUser = jest.fn();
const mockGetBookingById = jest.fn();
const mockSendRenderError = jest.fn();

jest.unstable_mockModule("../../services/courseService.js", () => ({ CourseService: mockCourseService }));
jest.unstable_mockModule("../../services/bookingService.js", () => ({
    bookCourseForUser: mockBookCourseForUser,
    bookSessionForUser: mockBookSessionForUser,
    getBookingById: mockGetBookingById,
}));
jest.unstable_mockModule("../../utils/dateFormatter.js", () => ({ fmtDate: jest.fn(() => "formatted-date") }));
jest.unstable_mockModule("../../helpers/errorHandlers.js", () => ({ sendRenderError: mockSendRenderError }));

const {
    homePage,
    postBookCourse,
    postBookSession,
    bookingConfirmationPage,
} = await import("../../controllers/viewsController.js");

const makeRes = () => ({ render: jest.fn(), redirect: jest.fn() });

describe("viewsController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders home with featured courses", async () => {
        const req = { user: null };
        const res = makeRes();
        const next = jest.fn();

        mockCourseService.getFeaturedCourses.mockResolvedValue([{ _id: "c1" }]);

        await homePage(req, res, next);

        expect(res.render).toHaveBeenCalledWith("pages/home", expect.objectContaining({ title: "Yoga Courses" }));
    });

    it("redirects after booking course and session", async () => {
        const reqCourse = { params: { id: "c1" }, user: { _id: "u1" } };
        const reqSession = { params: { id: "s1" }, user: { _id: "u1" } };
        const res = makeRes();
        const next = jest.fn();

        mockBookCourseForUser.mockResolvedValue({ _id: "b1", status: "CONFIRMED" });
        mockBookSessionForUser.mockResolvedValue({ _id: "b2", status: "CONFIRMED" });

        await postBookCourse(reqCourse, res, next);
        await postBookSession(reqSession, res, next);

        expect(res.redirect).toHaveBeenNthCalledWith(1, "/bookings/b1?status=CONFIRMED");
        expect(res.redirect).toHaveBeenNthCalledWith(2, "/bookings/b2?status=CONFIRMED");
    });

    it("renders booking confirmation", async () => {
        const req = { params: { bookingId: "b1" }, query: {}, user: { _id: "u1" } };
        const res = makeRes();
        const next = jest.fn();

        mockGetBookingById.mockResolvedValue({ _id: "b1", type: "COURSE", status: "CONFIRMED", createdAt: "2024-01-01" });

        await bookingConfirmationPage(req, res, next);

        expect(res.render).toHaveBeenCalledWith("pages/booking-confirmation", expect.objectContaining({
            booking: expect.objectContaining({ id: "b1", createdAt: "formatted-date" }),
        }));
        expect(next).not.toHaveBeenCalled();
    });
});
