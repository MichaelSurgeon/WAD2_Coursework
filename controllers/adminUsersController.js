import { UserService } from "../services/userService.js";
import { AuthService } from "../services/authService.js";
import { ValidationService } from "../services/validationService.js";
import { sendRenderError } from "../helpers/errorHandlers.js";

const formatUserForAdmin = (user) => ({
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    isOrganiser: user.role === "organiser",
});

export const listUsers = async (req, res, next) => {
    try {
        const users = await UserService.getAllUsers();
        const currentUserId = req.user._id;

        res.render("pages/admin/users", {
            title: "Manage Users",
            user: req.user,
            users: users.map((u) => {
                const formattedUser = formatUserForAdmin(u);
                return {
                    ...formattedUser,
                    isCurrentUser: formattedUser._id === currentUserId,
                };
            }),
        });
    } catch (err) {
        next(err);
    }
};

export const showAddUserPage = (req, res, next) => {
    try {
        res.render("pages/admin/user-form", {
            title: "Add User",
            user: req.user,
        });
    } catch (err) {
        next(err);
    }
};

export const postAddUser = async (req, res, next) => {
    try {
        const { username, email, password, passwordConfirm } = req.body;

        const renderError = (error) => res.render("pages/admin/user-form", {
            title: "Add User",
            user: req.user,
            error,
            username,
            email,
        });

        const validationErrors = ValidationService.validateRegistration(req.body);
        if (validationErrors)
            return renderError(validationErrors[0]);

        const authErrors = await AuthService.validateRegister(username, email, password, passwordConfirm);
        if (authErrors)
            return renderError(authErrors[0]);

        await AuthService.createUser(username, email, password);
        res.redirect("/admin/users");
    } catch (err) {
        next(err);
    }
};

export const promoteUserToOrganiser = async (req, res, next) => {
    try {
        await UserService.promoteToOrganiser(req.params.id);
        res.redirect("/admin/users");
    } catch (err) {
        next(err);
    }
};

export const demoteUserToStudent = async (req, res, next) => {
    try {
        await UserService.demoteToStudent(req.params.id);
        res.redirect("/admin/users");
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        if (req.params.id === req.user._id) {
            return sendRenderError(res, "You cannot delete your own account", 403, {
                title: "Cannot Delete",
                user: req.user,
            });
        }
        await UserService.deleteUser(req.params.id);
        res.redirect("/admin/users");
    } catch (err) {
        next(err);
    }
};
