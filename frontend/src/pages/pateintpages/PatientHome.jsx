import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientNavbar from "../../components/PatientNavbar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { getMyAppointments } from "../../services/patientService.js";

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
                    (a) => (a.status === "pending" || a.status === "confirmed") && new Date(a.date) >= new Date(now.toISOString().split("T")[0])
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
                        <div className="welcome-icon">🧑</div>
                    </div>

                    {error && (
                        <div style={{
                            padding: "12px 16px",
                            marginBottom: "16px",
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "8px",
                            color: "var(--rejected, #ef4444)",
                            fontSize: "14px"
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="stats-grid">
                        <div className="stat-card-dash">
                            <div className="icon">📅</div>
                            <div className="number teal">{loading ? "..." : stats.upcoming}</div>
                            <div className="label">Upcoming Appointments</div>
                        </div>
                        <div className="stat-card-dash">
                            <div className="icon">✅</div>
                            <div className="number green">{loading ? "..." : stats.completed}</div>
                            <div className="label">Completed Visits</div>
                        </div>
                        <div className="stat-card-dash">
                            <div className="icon">📋</div>
                            <div className="number gold">{loading ? "..." : stats.total}</div>
                            <div className="label">Total Appointments</div>
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
                            onClick={() => navigate("/patient/finddoctor")}
                            style={{ cursor: "pointer", textAlign: "center", padding: "40px" }}>
                            <div style={{ fontSize: "60px", marginBottom: "16px" }}>🔍</div>
                            <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Find a Doctor</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Browse our network of verified
                                specialists</p>
                        </div>
                        <div className="doctor-card"
                            onClick={() => navigate("/patient/appointment")}
                            style={{ cursor: "pointer", textAlign: "center", padding: "40px" }}>
                            <div style={{ fontSize: "60px", marginBottom: "16px" }}>📋</div>
                            <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>My Appointments</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>View and manage your scheduled
                                visits</p>
                        </div>
                        <div className="doctor-card"
                            onClick={() => navigate("/patient/finddoctor")}
                            style={{ cursor: "pointer", textAlign: "center", padding: "40px" }}>
                            <div style={{ fontSize: "60px", marginBottom: "16px" }}>📊</div>
                            <h3 style={{ fontSize: "20px", marginBottom: "8px" }}>Health Records</h3>
                            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Track your medical history</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PatientHome;