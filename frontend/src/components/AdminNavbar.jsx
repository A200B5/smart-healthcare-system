import {useTheme} from "../context/ThemeContext.jsx";
import {NavLink, useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";

function AdminNavbar() {
    const {theme , toggleTheme} = useTheme();
    const navigate = useNavigate();
    const {logout} = useAuth();
    const handleLogout = () => {
        logout();
        navigate("/")
    }
    return (
        <>
            <nav className="navbar hidden" id="navbar-admin">
                <div className="navbar-logo" >
                    <span>🏥</span> MediCare Pro
                </div>
                <ul className="navbar-links">
                    <li><NavLink to="/admin/dashboard"
                           data-link="admin-dashboard">Dashboard</NavLink></li>
                    <li><NavLink to="/admin/managedoctor" data-link="admin-doctors">Doctors</NavLink></li>
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
    )
}

export default AdminNavbar