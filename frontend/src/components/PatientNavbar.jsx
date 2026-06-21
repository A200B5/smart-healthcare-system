import {useTheme} from "../context/ThemeContext.jsx";

function PatientNavbar(){
    const {theme , toggleTheme} = useTheme();
    return (
        <>
            <nav className="navbar hidden" id="navbar-patient">
                <div className="navbar-logo" >
                    <span>🏥</span> MediCare Pro
                </div>
                <ul className="navbar-links">
                    <li><a className="active" data-link="patient-home">Home</a></li>
                    <li><a data-link="patient-doctors">Find Doctors</a></li>
                    <li><a data-link="patient-appointments">My Appointments</a></li>
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
                    <button className="btn-logout" >Logout</button>
                </div>
            </nav>
        </>
    )
}

export default PatientNavbar;