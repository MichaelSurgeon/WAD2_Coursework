import { AuthService } from "../services/authService.js";
import { ValidationService } from "../services/validationService.js";

export const loginPage = (req, res, next) => {
    try {
        res.render("pages/auth/login", { title: "Login" });
    } catch (err) {
        next(err);
    }
};

export const loginHandler = async (req, res, next) => {
    try {
        const { username, password } = req.body;

        const renderError = (error) => res.render("pages/auth/login", { title: "Login", error, username });

        const validationErrors = ValidationService.validateLogin(req.body);
        if (validationErrors)
            return renderError(validationErrors[0]);

        const user = await AuthService.validateLogin(username, password);
        if (!user)
            return renderError("Invalid credentials");

        const token = AuthService.createToken(user);
        const options = AuthService.getTokenOptions();
        res.cookie("jwt", token, options);
        res.redirect("/");
    } catch (err) {
        next(err);
    }
};

export const registerPage = (req, res, next) => {
    try {
        res.render("pages/auth/register", { title: "Register" });
    } catch (err) {
        next(err);
    }
};

export const registerHandler = async (req, res, next) => {
    try {
        const { username, email, password, passwordConfirm } = req.body;

        const renderError = (error) => res.render("pages/auth/register", { title: "Register", error, username, email });

        const validationErrors = ValidationService.validateRegistration(req.body);
        if (validationErrors)
            return renderError(validationErrors[0]);

        const authErrors = await AuthService.validateRegister(username, email, password, passwordConfirm);
        if (authErrors)
            return renderError(authErrors[0]);

        const newUser = await AuthService.createUser(username, email, password);
        const token = AuthService.createToken(newUser);
        const options = AuthService.getTokenOptions();
        res.cookie("jwt", token, options);
        res.redirect("/");
    } catch (err) {
        next(err);
    }
};

export const logoutConfirmationPage = (req, res, next) => {
    try {
        res.render("pages/logout-confirmation", { title: "Logout Confirmation" });
    } catch (err) {
        next(err);
    }
};

export const logout = (req, res, next) => {
    try {
        res.clearCookie("jwt");
        res.redirect("/login");
    } catch (err) {
        next(err);
    }
};
