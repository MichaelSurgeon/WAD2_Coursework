export const ValidationService = {
    _validateDateRange(startDate, endDate, errors) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start.getTime())) {
            errors.push("Invalid start date format");
        } else if (isNaN(end.getTime())) {
            errors.push("Invalid end date format");
        } else if (end <= start) {
            errors.push("End date must be after start date");
        }
    },

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    validateCourse(data) {
        const errors = [];

        if (!data.title?.trim()) {
            errors.push("Course title is required");
        } else if (data.title.length > 200) {
            errors.push("Title must be 200 characters or less");
        }

        if (!data.description?.trim()) {
            errors.push("Description is required");
        } else if (data.description.length > 2000) {
            errors.push("Description must be 2000 characters or less");
        }

        if (!data.level) {
            errors.push("Level is required");
        } else if (!["beginner", "intermediate", "advanced"].includes(data.level)) {
            errors.push("Invalid level");
        }

        if (!data.type) {
            errors.push("Type is required");
        } else if (!["WEEKLY_BLOCK", "WEEKEND_WORKSHOP"].includes(data.type)) {
            errors.push("Invalid course type");
        }

        if (data.startDate && data.endDate) {
            this._validateDateRange(data.startDate, data.endDate, errors);
        }

        return errors.length > 0 ? errors : null;
    },

    validateLogin(data) {
        const errors = [];

        if (!data.username?.trim()) errors.push("Username is required");
        if (!data.password) errors.push("Password is required");

        return errors.length > 0 ? errors : null;
    },

    validateRegistration(data) {
        const errors = [];

        if (!data.username?.trim()) {
            errors.push("Username is required");
        } else if (data.username.length < 3) {
            errors.push("Username must be at least 3 characters");
        } else if (data.username.length > 50) {
            errors.push("Username must be 50 characters or less");
        }

        if (!data.email?.trim()) {
            errors.push("Email is required");
        } else if (!this.isValidEmail(data.email)) {
            errors.push("Invalid email format");
        }

        if (!data.password) {
            errors.push("Password is required");
        } else if (data.password.length < 8) {
            errors.push("Password must be at least 8 characters");
        } else if (data.password.length > 128) {
            errors.push("Password must be 128 characters or less");
        }

        if (!data.passwordConfirm) {
            errors.push("Password confirmation is required");
        } else if (data.password !== data.passwordConfirm) {
            errors.push("Passwords do not match");
        }

        return errors.length > 0 ? errors : null;
    },

    validateSession(data) {
        const errors = [];

        if (!data.startDateTime) errors.push("Session start date and time is required");
        if (!data.endDateTime) errors.push("Session end date and time is required");

        if (!data.capacity) {
            errors.push("Session capacity is required");
        } else {
            const capacity = parseInt(data.capacity, 10);
            if (isNaN(capacity) || capacity < 1) {
                errors.push("Session capacity must be at least 1");
            }
        }

        if (!data.location?.trim()) {
            errors.push("Session location is required");
        } else if (data.location.length > 200) {
            errors.push("Session location must be 200 characters or less");
        }

        if (!data.description?.trim()) {
            errors.push("Session description is required");
        } else if (data.description.length > 2000) {
            errors.push("Session description must be 2000 characters or less");
        }

        const price = parseFloat(data.price);
        if (!data.price || data.price === "") {
            errors.push("Session price is required");
        } else if (isNaN(price) || price < 0 || price > 99999) {
            errors.push("Session price must be between 0 and 99999");
        }

        if (data.startDateTime && data.endDateTime) {
            this._validateDateRange(data.startDateTime, data.endDateTime, errors);
        }

        return errors.length > 0 ? errors : null;
    },
};