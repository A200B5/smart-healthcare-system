import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { getCurrentUser } from "../services/authService";
import { useAuth } from "../context/AuthContext.jsx";

function DoctorNavbar() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const doctorName = user?.name || "Doctor";

    const handleNavigation = (path) => {
        if (window.onNavigateBlocker) {
            window.onNavigateBlocker(path, () => navigate(path));
            return;
        }
        navigate(path);
    };

    const handleLogout = () => {
        if (window.onNavigateBlocker) {
            window.onNavigateBlocker("/login", () => {
                logout();
                navigate("/login", { replace: true });
            });
            return;
        }
        logout();
        navigate("/login", { replace: true });
    };

    return (
        <nav className="navbar" id="navbar-doctor">
            <div
                className="navbar-logo"
                onClick={() => handleNavigation("/doctor/dashboard")}
            >
                <span>🏥</span> MediCare Pro
            </div>

            <ul className="navbar-links">
                <li>
                    <a
                        className={
                            location.pathname === "/doctor/dashboard" ||
                                location.pathname === "/doctor"
                                ? "active"
                                : ""
                        }
                        onClick={() => handleNavigation("/doctor/dashboard")}
                    >
                        Dashboard
                    </a>
                </li>

                <li>
                    <a
                        className={
                            location.pathname === "/doctor/profile"
                                ? "active"
                                : ""
                        }
                        onClick={() => handleNavigation("/doctor/profile")}
                    >
                        My Profile
                    </a>
                </li>

                <li>
                    <a
                        className={
                            location.pathname === "/doctor/schedule"
                                ? "active"
                                : ""
                        }
                        onClick={() => handleNavigation("/doctor/schedule")}
                    >
                        My Schedule
                    </a>
                </li>
            </ul>

            <div className="navbar-actions">
                <button
                    className="theme-toggle-nav"
                    onClick={toggleTheme}
                >
                    {theme === "light" ? "🌙" : "☀️"}
                </button>

                <div className="user-badge">
                    <div
                        className="user-avatar"
                        style={{ background: "#3B82F6" }}
                    >
                        👨‍⚕️
                    </div>

                    <div>
                        <div className="user-name">
                            Dr. {doctorName}
                        </div>

                        <div className="role-tag">
                            Doctor
                        </div>
                    </div>
                </div>

                <button
                    className="btn-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default DoctorNavbar;