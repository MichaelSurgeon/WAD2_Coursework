export const getErrorStatusCode = (err) => {
    if (err.code === "NOT_FOUND") return 404;
    if (err.code === "DROPIN_NOT_ALLOWED") return 400;
    if (err.code === "UNAUTHORIZED") return 403;
    return 500;
};

export const sendJsonError = (res, err) => {
    const statusCode = getErrorStatusCode(err);
    res.status(statusCode).json({ error: err.message });
};

export const sendRenderError = (res, title, message, statusCode = 404) => {
    res.status(statusCode).render("pages/error", {
        title,
        message,
    });
};

export const handleAsyncError = async (fn, defaultError = "Internal Server Error") => {
    try {
        return await fn();
    } catch (err) {
        const newErr = new Error(err.message || defaultError);
        newErr.code = err.code;
        newErr.originalError = err;
        throw newErr;
    }
};
