export const formatUserForAdmin = (user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    isOrganiser: user.role === "organiser",
});

export const formatBookingForConfirmation = (booking, createdAtFormatter) => ({
    id: booking._id,
    type: booking.type,
    status: booking.status,
    createdAt: booking.createdAt ? createdAtFormatter(booking.createdAt) : "",
});

export const formatCourseDetail = (courseData) => {
    const { sessions, ...course } = courseData;
    return { course, sessions };
};

export const parseDropInFilter = (dropin) => {
    const dropInMap = { yes: true, no: false };
    return dropInMap[dropin];
};
