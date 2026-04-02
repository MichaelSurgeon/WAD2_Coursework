import { UserModel } from "../models/userModel.js";

export const ensureUser = async (req, res, next) => {
    try {
        if (!req.user) {
            const email = "fiona@student.local";
            let user = await UserModel.findByEmail(email);
            if (!user) {
                try {
                    user = await UserModel.create({
                        name: "Fiona",
                        email,
                        role: "student",
                    });
                } catch (err) {
                    // If creation fails due to unique constraint, try finding again
                    user = await UserModel.findByEmail(email);
                    if (!user) throw err;
                }
            }
            req.user = user;
        }
        res.locals.user = req.user;
        next();
    } catch (err) {
        next(err);
    }
};
