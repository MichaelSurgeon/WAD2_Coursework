import jwt from "jsonwebtoken";

const verifyToken = (token) => {
    if (!token) {
        throw new Error("No token provided");
    }
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

export const verifyUser = (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("Token verification failed:", err.message);
        res.redirect("/login");
    }
};

export const verifyOrganiser = (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        const decoded = verifyToken(token);
        req.user = decoded;

        if (req.user.role !== "organiser") {
            return res.status(403).render("pages/error", {
                title: "Access Denied",
                message: "You must be an organiser to access this page.",
            });
        }

        next();
    } catch (err) {
        console.error("Organiser verification failed:", err.message);
        res.redirect("/login");
    }
};
