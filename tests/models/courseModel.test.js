import { jest, describe, it, expect, beforeAll, beforeEach } from "@jest/globals";

const coursesDbMock = {
    find: jest.fn(),
    count: jest.fn(),
    insert: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

jest.unstable_mockModule("../../models/_db.js", () => ({
    coursesDb: coursesDbMock,
}));

let CourseModel;

const createChain = ({ items = [] } = {}) => {
    const chain = {
        sort: jest.fn(() => chain),
        skip: jest.fn(() => chain),
        limit: jest.fn(() => Promise.resolve(items)),
    };

    return chain;
};

beforeAll(async () => {
    ({ CourseModel } = await import("../../models/courseModel.js"));
});

describe("CourseModel.getPaginatedCourses", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("applies level/type/text filters and escapes search regex", async () => {
        const findChain = createChain({ items: [{ _id: "c1" }] });
        coursesDbMock.find.mockReturnValue(findChain);
        coursesDbMock.count.mockResolvedValue(1);

        await CourseModel.getPaginatedCourses(1, 4, {
            q: "flow+",
            level: "beginner",
            type: "WEEKLY_BLOCK",
        });

        const appliedFilter = coursesDbMock.find.mock.calls[0][0];
        expect(appliedFilter.level).toBe("beginner");
        expect(appliedFilter.type).toBe("WEEKLY_BLOCK");
        expect(appliedFilter.$or).toHaveLength(2);
        expect(appliedFilter.$or[0].title).toBeInstanceOf(RegExp);
        expect(appliedFilter.$or[0].title.source).toBe("flow\\+");
        expect(coursesDbMock.count).toHaveBeenCalledWith(appliedFilter);
    });

    it("builds pagination links with encoded filters", async () => {
        const items = [{ _id: "c1" }, { _id: "c2" }];
        const findChain = createChain({ items });

        coursesDbMock.find.mockReturnValue(findChain);
        coursesDbMock.count.mockResolvedValue(6);

        const result = await CourseModel.getPaginatedCourses(2, 2, {
            q: "yin & yang",
            level: "intermediate",
            type: "WEEKEND_WORKSHOP",
        });

        expect(result.pagination.hasPrev).toBe(true);
        expect(result.pagination.hasNext).toBe(true);
        expect(result.pagination.prevLink).toBe(
            "?page=1&pageSize=2&q=yin%20%26%20yang&level=intermediate&type=WEEKEND_WORKSHOP"
        );
        expect(result.pagination.nextLink).toBe(
            "?page=3&pageSize=2&q=yin%20%26%20yang&level=intermediate&type=WEEKEND_WORKSHOP"
        );
    });

    it("normalizes invalid page and pageSize values", async () => {
        const findChain = createChain({ items: [{ _id: "c1" }] });

        coursesDbMock.find.mockReturnValue(findChain);
        coursesDbMock.count.mockResolvedValue(1);

        const result = await CourseModel.getPaginatedCourses(0, 0, {});

        expect(findChain.skip).toHaveBeenCalledWith(0);
        expect(findChain.limit).toHaveBeenCalledWith(4);
        expect(result.pagination.page).toBe(1);
        expect(result.pagination.pageSize).toBe(4);
        expect(result.pagination.hasPrev).toBe(false);
        expect(result.pagination.hasNext).toBe(false);
    });
});

describe("CourseModel.getCourses", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("applies sort and limit when provided", async () => {
        const findChain = createChain({ items: [] });
        coursesDbMock.find.mockReturnValue(findChain);

        await CourseModel.getCourses({
            sort: { createdAt: -1 },
            limit: 2,
            filter: { level: "advanced" },
        });

        expect(coursesDbMock.find).toHaveBeenCalledWith({ level: "advanced" });
        expect(findChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
        expect(findChain.limit).toHaveBeenCalledWith(2);
    });
});
