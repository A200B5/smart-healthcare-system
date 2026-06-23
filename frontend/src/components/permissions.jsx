import { useAuth } from "../context/AuthContext.jsx";

/**
 * Conditionally renders children if the current user has one of the allowed roles.
 * @param {Array<string>} allowedRoles - Array of role strings (e.g., ['admin', 'doctor'])
 * @param {ReactNode} children - UI elements to render if authorized
 */
export const HasRole = ({ allowedRoles, children }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return null;
    }

    if (!allowedRoles.includes(user.role)) {
        return null;
    }

    return children;
};

/**
 * Conditionally renders children if the current user is the owner of the resource.
 * Typically used for patient checking their own appointments or doctor their own profile.
 * Admins implicitly bypass this check to manage anything.
 * @param {number|string} resourceOwnerId - The ID of the user who owns the resource
 * @param {ReactNode} children - UI elements to render if authorized
 */
export const IsOwner = ({ resourceOwnerId, children }) => {
    const { user, isAuthenticated, isAdmin } = useAuth();

    if (!isAuthenticated || !user) {
        return null;
    }

    // Admin has universal access
    if (isAdmin) {
        return children;
    }

    // Must strictly match user ID
    if (String(user.id) !== String(resourceOwnerId)) {
        return null;
    }

    return children;
};
