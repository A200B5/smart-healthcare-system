import PatientNavbar from "../../components/PatientNavbar.jsx";
import {useNavigate} from "react-router-dom";

function PatientHome(){
    const navigate = useNavigate();
    return(
        <>
            <PatientNavbar/>
            <div className="page" id="page-patient-home">
                <div className="page-content">
                    <div className="welcome-banner">
                        <div className="welcome-text">
                            <h2>Welcome back, Sabry! 👋</h2>
                            <p>Manage your health and book appointments easily</p>
                        </div>
                        <div className="welcome-icon">🧑</div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card-dash">
                            <div className="icon">📅</div>
                            <div className="number teal">3</div>
                            <div className="label">Upcoming Appointments</div>
                        </div>
                        <div className="stat-card-dash">
                            <div className="icon">✅</div>
                            <div className="number green">12</div>
                            <div className="label">Completed Visits</div>
                        </div>
                        <div className="stat-card-dash">
                            <div className="icon">👨‍⚕️</div>
                            <div className="number gold">5</div>
                            <div className="label">Favorite Doctors</div>
                        </div>
                        <div className="stat-card-dash">
                            <div className="icon">💊</div>
                            <div className="number">8</div>
                            <div className="label">Active Prescriptions</div>
                        </div>
                    </div>

                    <div className="page-header">
                        <div>
                            <h2 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>Quick
                                Actions</h2>
                        </div>
                    </div>

                    <div className="doctors-grid">
                        <div className="doctor-card"
                             onClick={ () => navigate("/patient/finddoctor") }
                             style={{ cursor: "pointer", textAlign: "center", padding: "40px" }}>
                            <div style={{ fontSize: "60px", marginBottom: "16px" }}>🔍</div>
                            <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Find a Doctor</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Browse our network of verified
                                specialists</p>
                        </div>
                        <div className="doctor-card"
                             onClick={ () => navigate("/patient/appointment") }
                             style={{ cursor: "pointer", textAlign: "center", padding: "40px" }}>
                            <div style={{ fontSize: "60px", marginBottom: "16px" }}>📋</div>
                            <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>My Appointments</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>View and manage your scheduled
                                visits</p>
                        </div>
                        <div className="doctor-card" style={{ cursor: "pointer", textAlign: "center", padding: "40px" }}>
                            <div style={{ fontSize: "60px", marginBottom: "16px" }}>📊</div>
                            <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Health Records</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Track your medical history</p>
                        </div>
                    </div>
                </div>
            </div>

        </>
    )
}

export default PatientHome;