import { UserService } from "../services/userService.js";
import { AuthService } from "../services/authService.js";
import { ValidationService } from "../services/validationService.js";
import { formatUserForAdmin } from "../helpers/dataTransformers.js";

export const listUsers = async (req, res, next) => {
    try {
        const users = await UserService.getAllUsers();
        const currentUserId = req.user._id;

        res.render("pages/admin/users", {
            title: "Manage Users",
            user: req.user,
            users: users.map(u => ({
                ...formatUserForAdmin(u),
                isCurrentUser: u.id === currentUserId,
            })),
        });
    } catch (err) {
        next(err);
    }
};

export const showAddUserPage = (req, res) => {
    res.render("pages/admin/user-form", {
        title: "Add User",
        user: req.user,
    });
};

export const postAddUser = async (req, res, next) => {
    try {
        const { username, email, password, passwordConfirm } = req.body;

        const validationErrors = ValidationService.validateRegistration(req.body);
        if (validationErrors) {
            return res.render("pages/admin/user-form", {
                title: "Add User",
                user: req.user,
                error: validationErrors[0],
                username,
                email,
            });
        }

        const authErrors = await AuthService.validateRegister(username, email, password, passwordConfirm);
        if (authErrors) {
            return res.render("pages/admin/user-form", {
                title: "Add User",
                user: req.user,
                error: authErrors[0],
                username,
                email,
            });
        }

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
            return res.status(403).render("pages/error", {
                title: "Cannot Delete",
                user: req.user,
                message: "You cannot delete your own account",
            });
        }
        await UserService.deleteUser(req.params.id);
        res.redirect("/admin/users");
    } catch (err) {
        next(err);
    }
};
