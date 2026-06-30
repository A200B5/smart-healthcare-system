import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientNavbar from "../../components/PatientNavbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyAppointments } from "../../services/patientService.js";
import "./patient.css";

function PatientHome() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ upcoming: 0, completed: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadStats = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getMyAppointments();
                const appointments = data?.appointments || [];
                const now = new Date();
                const upcoming = appointments.filter(
                    (a) => (a.status === "confirmed") && new Date(a.date) >= new Date(now.toISOString().split("T")[0])
                ).length;
                const completed = appointments.filter((a) => a.status === "completed").length;
                setStats({ upcoming, completed, total: appointments.length });
            } catch (err) {
                setError(err.message || "Failed to load dashboard data");
                setStats({ upcoming: 0, completed: 0, total: 0 });
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    const displayName = user?.name || "Patient";

    return (
        <>
            <PatientNavbar />
            <div className="page" id="page-patient-home">
                <div className="page-content">
                    <div className="welcome-banner">
                        <div className="welcome-text">
                            <h2>Welcome back, {displayName}! 👋</h2>
                            <p>Manage your health and book appointments easily</p>
                        </div>

                    </div>

                    {error && (
                        <div className="patient-home-error">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="stats-grid">
                        <div className="stat-card-dash">

                            <div className="number teal">{loading ? "..." : stats.upcoming}</div>
                            <div className="label">Upcoming Appointments</div>
                        </div>
                        <div className="stat-card-dash">

                            <div className="number green">{loading ? "..." : stats.completed}</div>
                            <div className="label">Completed Visits</div>
                        </div>
                        <div className="stat-card-dash">

                            <div className="number gold">{loading ? "..." : stats.total}</div>
                            <div className="label">Total Appointments</div>
                        </div>
                    </div>

                    <div className="page-header">
                        <div>
                            <h2 className="patient-home-section-title">Quick Actions</h2>
                        </div>
                    </div>

                    <div className="doctors-grid">
                        <div className="doctor-card patient-action-card" onClick={() => navigate("/patient/finddoctor")}>
                            <div className="patient-action-icon">🔍</div>
                            <h3 className="patient-action-title">Find a Doctor</h3>
                            <p className="patient-action-desc">Browse our network of verified specialists</p>
                        </div>
                        <div className="doctor-card patient-action-card" onClick={() => navigate("/patient/appointment")}>
                            <div className="patient-action-icon">📋</div>
                            <h3 className="patient-action-title">My Appointments</h3>
                            <p className="patient-action-desc">View and manage your scheduled visits</p>
                        </div>
                        <div className="doctor-card patient-action-card" onClick={() => navigate("/patient/finddoctor")}>
                            <div className="patient-action-icon">📊</div>
                            <h3 className="patient-action-title">Health Records</h3>
                            <p className="patient-action-desc">Track your medical history</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PatientHome;