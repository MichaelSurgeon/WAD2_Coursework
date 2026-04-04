export const sendRenderError = (res, message = "Resource not found", statusCode = 404) => {
    res.status(statusCode).render("pages/error", {
        title: statusCode === 404 ? "Not Found" : "Error",
        message,
    });
};
