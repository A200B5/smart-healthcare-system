/**
 * Returns the appropriate home route based on the user's role.
 * Useful for 404 pages, login success redirects, and "return home" buttons
 * to ensure users are kept in their contextual flow.
 *
 * @param {Object} user - The authenticated user object containing the role.
 * @returns {string} The path to navigate to.
 */
export const getRoleHomeRoute = (user) => {
    if (!user) return "/";
    
    switch (user.role) {
        case "patient":
            return "/patient/home";
        case "doctor":
            return "/doctor/dashboard";
        case "admin":
            return "/admin/dashboard";
        default:
            return "/";
    }
};
