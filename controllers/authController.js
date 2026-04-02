import { AuthService } from "../services/authService.js";
import { ValidationService } from "../services/validationService.js";

export const loginPage = (req, res) => {
    res.render("pages/auth/login", { title: "Login" });
};

export const loginHandler = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const validationErrors = ValidationService.validateLogin(req.body);
        if (validationErrors) {
            return res.render("pages/auth/login", {
                title: "Login",
                error: validationErrors[0],
                username,
            });
        }

        const user = await AuthService.validateLogin(username, password);

        if (!user) {
            return res.render("pages/auth/login", {
                title: "Login",
                error: "Invalid credentials",
                username,
            });
        }

        const token = AuthService.createToken(user);
        const options = AuthService.getTokenOptions();
        res.cookie("jwt", token, options);
        res.redirect("/");
    } catch (err) {
        next(err);
    }
};

export const registerPage = (req, res) => {
    res.render("pages/auth/register", { title: "Register" });
};

export const registerHandler = async (req, res, next) => {
    try {
        const { username, email, password, passwordConfirm } = req.body;

        const validationErrors = ValidationService.validateRegistration(req.body);
        if (validationErrors) {
            return res.render("pages/auth/register", {
                title: "Register",
                error: validationErrors[0],
                username,
                email,
            });
        }

        const authErrors = await AuthService.validateRegister(username, email, password, passwordConfirm);
        if (authErrors) {
            return res.render("pages/auth/register", {
                title: "Register",
                error: authErrors[0],
                username,
                email,
            });
        }

        const newUser = await AuthService.createUser(username, email, password);
        const token = AuthService.createToken(newUser);
        const options = AuthService.getTokenOptions();
        res.cookie("jwt", token, options);
        res.redirect("/");
    } catch (err) {
        next(err);
    }
};

export const logout = (req, res) => {
    res.clearCookie("jwt");
    res.redirect("/");
};
