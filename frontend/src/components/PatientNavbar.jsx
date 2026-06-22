import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";

function PatientNavbar() {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navItems = [
        { path: "/patienthome", label: "Home", page: "patient-home" },
        { path: "/patientfinddoctor", label: "Find Doctors", page: "patient-doctors" },
        { path: "/patientappointment", label: "My Appointments", page: "patient-appointments" },
    ];

    const displayName = user?.name || "Patient";
    const avatarInitial = displayName.charAt(0).toUpperCase();

    return (
        <>
            <nav className="navbar" id="navbar-patient">
                <div className="navbar-logo" onClick={() => navigate("/patienthome")} style={{ cursor: "pointer" }}>
                    <span>🏥</span> MediCare Pro
                </div>
                <ul className="navbar-links">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <a
                                className={location.pathname === item.path ? "active" : ""}
                                onClick={() => navigate(item.path)}
                                style={{ cursor: "pointer" }}
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
                <div className="navbar-actions">
                    <button className="theme-toggle-nav" onClick={toggleTheme}>
                        {theme === "light" ? "🌙" : "☀️"}
                    </button>
                    <div className="user-badge">
                        <div className="user-avatar">{avatarInitial}</div>
                        <div>
                            <div className="user-name" id="patient-name">{displayName}</div>
                            <div className="role-tag">Patient</div>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>Logout</button>
                </div>
            </nav>
        </>
    );
}

export default PatientNavbar;