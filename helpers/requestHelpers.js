export const formatCourseData = (data) => {
    return {
        title: data.title,
        description: data.description,
        level: data.level,
        type: data.type,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        price: data.price ? parseFloat(data.price) : null,
        location: data.location || null,
        allowDropIn: data.allowDropIn,
    };
};

export const buildCourseFormData = (course) => {
    return {
        ...course,
        beginner: course.level === "beginner",
        intermediate: course.level === "intermediate",
        advanced: course.level === "advanced",
        block: course.type === "WEEKLY_BLOCK",
        workshop: course.type === "WEEKEND_WORKSHOP",
    };
};

export const renderCourseForm = (res, formData, options = {}) => {
    const { title, user, course, errors, isEdit } = options;
    res.render("pages/admin/course-form", {
        title,
        user,
        course,
        beginner: formData.beginner,
        intermediate: formData.intermediate,
        advanced: formData.advanced,
        block: formData.block,
        workshop: formData.workshop,
        ...(errors && { errors }),
        ...(isEdit && { isEdit }),
    });
};

export const buildSessionsRenderData = (user, course, formattedSessions, errors = null, fmtDateOnlyFn) => {
    const renderData = {
        title: `Add Sessions: ${course.title}`,
        user,
        course: {
            id: course.id,
            title: course.title,
            startDate: fmtDateOnlyFn(course.startDate),
            endDate: fmtDateOnlyFn(course.endDate),
        },
    };

    if (formattedSessions.length > 0) {
        renderData.sessionsList = {
            items: formattedSessions,
            count: formattedSessions.length,
        };
    }

    if (errors) {
        renderData.errors = { list: Array.isArray(errors) ? errors : [errors] };
    }

    return renderData;
};
