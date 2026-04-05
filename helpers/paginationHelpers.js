import { URLSearchParams } from "url";

export const buildPaginationObject = (page, pageSize, total, totalPages) => {
    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, total);
    return {
        page,
        pageSize,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        startItem,
        endItem,
    };
};

export const buildLink = (req, page, pageSize) => {
    const params = new URLSearchParams(req.query);
    params.set("page", page);
    params.set("pageSize", pageSize);
    const basePath = req.originalUrl.split("?")[0];
    return `${basePath}?${params.toString()}`;
};

export const parsePaginationParams = (page = "1", pageSize = "4") => {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.max(1, parseInt(pageSize, 10) || 4);
    return { p, ps };
};

export const paginateCourses = (courses, page, pageSize, req) => {
    const { p, ps } = parsePaginationParams(page, pageSize);
    const total = courses.length;
    const totalPages = Math.ceil(total / ps) || 1; // Divide total course by page size to get total pages, default to 1 when no course
    const pageItems = courses.slice((p - 1) * ps, p * ps); // Cut the courses to get items for current page 

    return {
        pageItems,
        pagination: {
            ...buildPaginationObject(p, ps, total, totalPages),
            prevLink: p > 1 ? buildLink(req, p - 1, ps) : null, // Build prev link if there is a previous page
            nextLink: p < totalPages ? buildLink(req, p + 1, ps) : null, // Build next link if there is a next page
        },
    };
};
