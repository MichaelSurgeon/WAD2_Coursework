export const requireOrganiser = (req, res) => {
    if (req.user?.role !== "organiser") {
        res.status(403).render("pages/error", {
            title: "Access Denied",
            message: "You must be an organiser to access this resource.",
        });
        return false;
    }
    return true;
};

export const requireUser = (req, res) => {
    if (!req.user) {
        res.redirect("/login");
        return false;
    }
    return true;
};

export const checkRole = (user, role) => {
    return user?.role === role;
};
