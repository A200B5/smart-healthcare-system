import {useTheme} from "../context/ThemeContext.jsx";
import {NavLink, useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";
function PatientNavbar(){
    const {theme , toggleTheme} = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
          logout();
          navigate("/");
    }
    return (
        <>
            <nav className="navbar hidden" id="navbar-patient">
                <div className="navbar-logo" >
                    <span>🏥</span> MediCare Pro
                </div>
                <ul className="navbar-links">
                    <li><NavLink to="/patient/home" data-link="patient-home">Home</NavLink></li>
                    <li><NavLink to="/patient/finddoctor" data-link="patient-doctors">Find Doctors</NavLink></li>
                    <li><NavLink to="/patient/appointment" data-link="patient-appointments">My Appointments</NavLink></li>
                </ul>
                <div className="navbar-actions">
                    <button className="theme-toggle-nav" onClick={toggleTheme}>{theme === "light" ? "🌙" : "☀️"}</button>
                    <div className="user-badge">
                        <div className="user-avatar">P</div>
                        <div>
                            <div className="user-name" id="patient-name">Patient</div>
                            <div className="role-tag">Patient</div>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>Logout</button>
                </div>
            </nav>
        </>
    )
}

export default PatientNavbar;