import {useTheme} from "../context/ThemeContext.jsx";

function DoctorNavbar() {
    const {theme , toggleTheme} = useTheme();
    return (
        <>
            <nav className="navbar hidden" id="navbar-doctor">
                <div className="navbar-logo" >
                    <span>🏥</span> MediCare Pro
                </div>
                <ul className="navbar-links">
                    <li>
                        <a  className="active"
                           data-link="doctor-dashboard">Dashboard</a></li>
                    <li>
                        <a  data-link="doctor-profile">My Profile</a></li>
                </ul>
                <div className="navbar-actions">
                    <button className="theme-toggle-nav" onClick={toggleTheme} >
                        {theme === "light" ? "🌙" : "☀️"}
                    </button>
                    <div className="user-badge">
                        <div className="user-avatar" style={{background: "#3B82F6"}} >👨‍⚕️</div>
                        <div>
                            <div className="user-name" id="doctor-name">Dr. Ahmed</div>
                            <div className="role-tag">Doctor</div>
                        </div>
                    </div>
                    <button className="btn-logout" >Logout</button>
                </div>
            </nav>
        </>
    )
}

export default DoctorNavbar;