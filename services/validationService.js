// services/validationService.js
export const ValidationService = {
    validateCourse(data) {
        const errors = [];

        // Required fields
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

        if (data.price !== null && data.price !== undefined && data.price !== "") {
            const price = parseFloat(data.price);
            if (isNaN(price)) {
                errors.push("Price must be a valid number");
            } else if (price < 0) {
                errors.push("Price cannot be negative");
            } else if (price > 99999) {
                errors.push("Price is too high");
            }
        }

        if (data.location && data.location.length > 200) {
            errors.push("Location must be 200 characters or less");
        }

        // Date validation
        if (data.startDate && data.endDate) {
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);

            if (isNaN(startDate.getTime())) {
                errors.push("Invalid start date format");
            } else if (isNaN(endDate.getTime())) {
                errors.push("Invalid end date format");
            } else if (endDate <= startDate) {
                errors.push("End date must be after start date");
            }
        }

        return errors.length > 0 ? errors : null;
    },

    validateLogin(data) {
        const errors = [];

        if (!data.username?.trim()) {
            errors.push("Username is required");
        }

        if (!data.password) {
            errors.push("Password is required");
        }

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

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
};
