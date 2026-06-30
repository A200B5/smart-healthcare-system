import { useTheme } from "../context/ThemeContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import "./components.css";

function PatientNavbar() {
    const { theme, toggleTheme } = useTheme();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const navItems = [
        { path: "/patient/home", label: "Home", page: "patient-home" },
        { path: "/patient/profile", label: "My Profile", page: "patient-profile" },
        { path: "/patient/finddoctor", label: "Find Doctors", page: "patient-doctors" },
        { path: "/patient/appointment", label: "My Appointments", page: "patient-appointments" },
        { path: "/patient/payments", label: "My Payments", page: "patient-payments" },
    ];

    const displayName = user?.name || "Patient";
    const avatarInitial = displayName.charAt(0).toUpperCase();

    return (
        <>
            <nav className="navbar" id="navbar-patient">
                <div className="navbar-logo nav-item-pointer" onClick={() => navigate("/patient/home")}>
                    <img src="/logo.png" alt="MediCare Pro Logo" className="navbar-logo-img" /> MediCare Pro
                </div>
                <ul className="navbar-links">
                    {navItems.map((item) => (
                        <li key={item.path}>
                            <a
                                className={`nav-item-pointer ${location.pathname === item.path ? "active" : ""}`}
                                onClick={() => navigate(item.path)}
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