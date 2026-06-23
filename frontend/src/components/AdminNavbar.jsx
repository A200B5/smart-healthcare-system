import { useTheme } from "../context/ThemeContext.jsx";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function AdminNavbar({ pendingCount = 0 }) {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    }
    return (
        <>
            <nav className="navbar hidden" id="navbar-admin">
                <NavLink to="/admin/dashboard" className="navbar-logo" >
                    <span>🏥</span> MediCare Pro
                </NavLink>
                <ul className="navbar-links">
                    <li><NavLink to="/admin/dashboard"
                        data-link="admin-dashboard">Dashboard</NavLink></li>
                    <li style={{ position: 'relative' }}>
                        <NavLink to="/admin/managedoctor" data-link="admin-doctors">Doctors</NavLink>
                        {pendingCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-12px',
                                background: '#EF4444',
                                color: 'white',
                                fontSize: '0.7rem',
                                fontWeight: 'bold',
                                padding: '2px 6px',
                                borderRadius: '10px'
                            }}>
                                {pendingCount}
                            </span>
                        )}
                    </li>
                    <li><NavLink to="/admin/manageuser" data-link="admin-users">Users</NavLink></li>
                    <li><NavLink to="/admin/manageappiontment" data-link="admin-appointments">Appointments</NavLink></li>
                </ul>
                <div className="navbar-actions">
                    <button className="theme-toggle-nav" onClick={toggleTheme}>
                        {theme === "light" ? "🌙" : "☀️"}</button>
                    <div className="user-badge">
                        <div className="user-avatar" style={{ background: "#F5A623" }}>🔑</div>
                        <div>
                            <div className="user-name" id="admin-name">Admin</div>
                            <div className="role-tag">Admin</div>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>Logout</button>
                </div>
            </nav>
        </>
    );
}

export default AdminNavbar;