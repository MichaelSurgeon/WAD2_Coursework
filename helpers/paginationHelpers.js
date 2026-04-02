import { URLSearchParams } from "url";

export const calculatePagination = (total, pageSize) => {
    return {
        total,
        totalPages: Math.ceil(total / pageSize) || 1,
    };
};

export const buildPaginationObject = (page, pageSize, total, totalPages) => {
    return {
        page,
        pageSize,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
    };
};

export const buildLink = (req, page, pageSize) => {
    const params = new URLSearchParams(req.query);
    params.set("page", page);
    params.set("pageSize", pageSize);
    const basePath = req.originalUrl.split("?")[0];
    return `${basePath}?${params.toString()}`;
};

export const parsePaginationParams = (page = "1", pageSize = "10") => {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const ps = Math.max(1, parseInt(pageSize, 10) || 10);
    return { p, ps };
};
