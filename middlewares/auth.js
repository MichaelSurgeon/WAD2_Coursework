import jwt from "jsonwebtoken";

const verifyToken = (token) => {
    if (!token) {
        throw new Error("No token provided");
    }
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

const decodeUserFromRequest = (req) => verifyToken(req.cookies.jwt);
const getUserFromRequest = (req) => req.user || decodeUserFromRequest(req);

export const verifyUser = (req, res, next) => {
    try {
        req.user = getUserFromRequest(req);
        return next();
    } catch (err) {
        console.error("Token verification failed:", err.message);
        return res.redirect("/login");
    }
};

export const verifyOrganiser = (req, res, next) => {
    try {
        req.user = getUserFromRequest(req);

        if (req.user.role !== "organiser") {
            return res.status(403).render("pages/error", {
                title: "Access Denied",
                message: "You must be an organiser to access this page.",
            });
        }

        return next();
    } catch (err) {
        console.error("Organiser verification failed:", err.message);
        return res.redirect("/login");
    }
};
