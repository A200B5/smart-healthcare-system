import {useTheme} from "../context/ThemeContext.jsx";
import {NavLink, useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";
function DoctorNavbar() {
    const {theme , toggleTheme} = useTheme();
    const navigate = useNavigate();
    const {logout} = useAuth();
    const handleLogout = () => {
        logout();
        navigate("/")
    }
    return (
        <>
            <nav className="navbar hidden" id="navbar-doctor">
                <div className="navbar-logo" >
                    <span>🏥</span> MediCare Pro
                </div>
                <ul className="navbar-links">
                    <li>
                        <NavLink  to="/doctor/dashboard"
                           data-link="doctor-dashboard">Dashboard</NavLink></li>
                    <li>
                        <NavLink to="/doctor/profile" data-link="doctor-profile">My Profile</NavLink></li>
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
                    <button className="btn-logout" onClick={handleLogout} >Logout</button>
                </div>
            </nav>
        </>
    )
}

export default DoctorNavbar;