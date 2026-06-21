import {useTheme} from "../context/ThemeContext.jsx";

function AdminNavbar() {
    const {theme , toggleTheme} = useTheme();
    return (
        <>
            <nav className="navbar hidden" id="navbar-admin">
                <div className="navbar-logo" >
                    <span>🏥</span> MediCare Pro
                </div>
                <ul className="navbar-links">
                    <li><a className="active"
                           data-link="admin-dashboard">Dashboard</a></li>
                    <li><a data-link="admin-doctors">Doctors</a></li>
                    <li><a data-link="admin-users">Users</a></li>
                    <li><a data-link="admin-appointments">Appointments</a></li>
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
                    <button className="btn-logout">Logout</button>
                </div>
            </nav>

        </>
    )
}

export default AdminNavbar