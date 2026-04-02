// middlewares/auth.js
import jwt from "jsonwebtoken";
import { UserModel } from "../models/userModel.js";

export const login = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await UserModel.findByUsername(username);
        if (!user) {
            return res.render("auth/login", {
                error: "Invalid credentials",
            });
        }

        // Compare password
        const isPasswordValid = await UserModel.comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.render("auth/login", {
                error: "Invalid credentials",
            });
        }

        // Create JWT with payload { username, role }
        const payload = { username: user.username, role: user.role };
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "1d",
        });

        // Store JWT in cookie
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        });

        req.user = payload;
        next();
    } catch (err) {
        next(err);
    }
};

export const verify = (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.redirect("/login");
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

export const verifyOrganiser = (req, res, next) => {
    try {
        const token = req.cookies.jwt;

        if (!token) {
            return res.redirect("/login");
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;

        if (req.user.role !== "organiser") {
            return res.status(403).json({ error: "Organiser access required" });
        }

        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid token" });
    }
};

export const logout = (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/");
};
