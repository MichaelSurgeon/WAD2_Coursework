import jwt from "jsonwebtoken";

export const ensureUser = async (req, res, next) => {
    try {
        if (req.user) {
            req.user.isOrganiser = req.user.role === "organiser";
            req.user.isStudent = req.user.role === "student";
            res.locals.user = req.user;
            return next();
        }

        const token = req.cookies.jwt;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                decoded.isOrganiser = decoded.role === "organiser";
                decoded.isStudent = decoded.role === "student";
                req.user = decoded;
                res.locals.user = decoded;
            } catch {
                res.locals.user = null;
            }
        } else {
            res.locals.user = null;
        }

        next();
    } catch (err) {
        next(err);
    }
};
