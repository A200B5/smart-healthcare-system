import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext.jsx";
import { getCurrentUser, logoutUser } from "../services/authService";

function DoctorNavbar() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [doctorName, setDoctorName] = useState("Doctor");

    useEffect(() => {
        const cachedUser = JSON.parse(localStorage.getItem("user") || "null");

        if (cachedUser?.name) {
            setDoctorName(cachedUser.name);
        }

        const loadUser = async () => {
            try {
                const data = await getCurrentUser();
                const user = data?.user || data;

                if (user?.name) {
                    setDoctorName(user.name);
                }
            } catch {
                //
            }
        };

        loadUser();
    }, []);

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    return (
        <nav className="navbar" id="navbar-doctor">
            <div
                className="navbar-logo"
                onClick={() => navigate("/doctor/dashboard")}
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
                        onClick={() => navigate("/doctor/dashboard")}
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
                        onClick={() => navigate("/doctor/profile")}
                    >
                        My Profile
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