export const parseQueryParams = (query) => {
    const { level, type, dropin, q, page = "1", pageSize = "10" } = query;
    return { level, type, dropin, q, page, pageSize };
};

export const parseFormParams = (body, fields) => {
    const result = {};
    fields.forEach((field) => {
        result[field] = body[field];
    });
    return result;
};

export const formatCourseData = (data) => {
    return {
        title: data.title,
        description: data.description,
        level: data.level,
        type: data.type,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        price: data.price ? parseFloat(data.price) : null,
        location: data.location || null,
        allowDropIn: data.allowDropIn,
    };
};

export const extractUserIdFromRequest = (req) => {
    return req.user?._id;
};

export const extractParamId = (req, paramName = "id") => {
    return req.params[paramName];
};
