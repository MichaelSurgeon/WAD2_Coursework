import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserModel } from "../models/userModel.js";

export const AuthService = {
    async validateLogin(username, password) {
        const user = await UserModel.findByUsername(username);
        if (!user) return null;

        const isValidPassword = await bcrypt.compare(password, user.password);
        return isValidPassword ? user : null;
    },

    async validateRegister(username, email, password, passwordConfirm) {
        const errors = [];

        if (!username || !email || !password || !passwordConfirm) {
            errors.push("All fields are required");
        }

        if (password !== passwordConfirm) {
            errors.push("Passwords do not match");
        }

        if (password && password.length < 8) {
            errors.push("Password must be at least 8 characters");
        }

        if (username) {
            const existingUsername = await UserModel.findByUsername(username);
            if (existingUsername) errors.push("Username already taken");
        }

        if (email) {
            const existingEmail = await UserModel.findByEmail(email);
            if (existingEmail) errors.push("Email already registered");
        }

        return errors.length > 0 ? errors : null;
    },

    async createUser(username, email, password) {
        const hashedPassword = await bcrypt.hash(password, 10);

        return UserModel.create({
            username,
            email,
            password: hashedPassword,
            role: "student",
        });
    },

    createToken(user) {
        const payload = { _id: user._id, username: user.username, role: user.role };
        return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "1d",
        });
    },

    getTokenOptions() {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        };
    },
};
