import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import GlobalLoader from "./loaders/GlobalLoader.jsx";

const RoleProtectedRoute = ({ allowedRoles, children }) => {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return <GlobalLoader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(user?.role)) {
        if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;
        if (user?.role === "doctor") return <Navigate to="/doctor/dashboard" replace />;
        if (user?.role === "patient") return <Navigate to="/patient/home" replace />;
        return <Navigate to="/" replace />;
    }

    return children;
};

export default RoleProtectedRoute;
