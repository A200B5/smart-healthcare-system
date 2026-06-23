import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorNavbar from "../../components/DoctorNavbar.jsx";
import API from "../../services/axios.js";
import {
  getAppointments,
  updateAppointmentStatus,
} from "../../services/appointmentService";
import { getDoctorProfile, getDoctorReviews } from "../../services/doctorService";

const dayOptions = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

const normalizeAppointments = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.appointments)
      ? payload.appointments
      : [];

  return list.map((app) => {
    let dateStr = app.date || app.appointmentDate || "-";
    if (dateStr && dateStr !== "-") {
      try {
        const d = new Date(dateStr);
        if (!isNaN(d)) {
          dateStr = d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        }
      } catch (e) { }
    }

    return {
      id: app.id || app._id,
      patientName: app.patientName || app.patient?.name || app.patient_name || "Unknown",
      specialty: app.specialty || app.type || app.doctorSpecialty || "General",
      date: dateStr,
      time: app.time || app.appointmentTime || "-",
      status: (app.status || "pending").toLowerCase(),
    };
  });
};

function DoctorDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [doctorId, setDoctorId] = useState(null);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState(null);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setScheduleLoading(true);
        setError(null);
        setScheduleError(null);

        const [appointmentsResult, scheduleResult, profileResult] = await Promise.allSettled([
          getAppointments(),
          API.get("/availability/my-schedule"),
          getDoctorProfile()
        ]);

        if (appointmentsResult.status === "fulfilled") {
          setAppointments(normalizeAppointments(appointmentsResult.value));
        } else {
          setAppointments([]);
          setError(
            appointmentsResult.reason?.message || "Failed to load appointments"
          );
        }

        if (scheduleResult.status === "fulfilled") {
          const scheduleData = scheduleResult.value?.data;
          setDoctorId(scheduleData?.doctorId || null);
          setSchedule(Array.isArray(scheduleData?.schedule) ? scheduleData.schedule : []);
        } else {
          setSchedule([]);
          setScheduleError(scheduleResult.reason?.message || "Failed to load availability");
        }

        if (profileResult.status === "fulfilled") {
          const profileData = profileResult.value?.doctor || profileResult.value;
          setDoctorProfile(profileData);
          if (profileData?.id) {
            try {
              const reviewsData = await getDoctorReviews(profileData.id);
              setReviews(reviewsData?.reviews || []);
            } catch (e) {
              console.error("Failed to fetch reviews");
            }
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        setScheduleLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await updateAppointmentStatus(id, status);

      setAppointments((prev) =>
        prev.map((app) =>
          app.id === id ? { ...app, status } : app
        )
      );
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Removed handleAvailabilitySubmit

  const filteredAppointments =
    filter === "all"
      ? appointments
      : appointments.filter((a) => a.status === filter);

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    availableDays: schedule.filter((s) => s.isAvailable).length,
  };

  return (
    <>
      <DoctorNavbar />

      <div className="page" id="page-doctor-dashboard">
        <div className="page-content">

          {/* Welcome */}
          <div className="welcome-banner">
            <div className="welcome-text">
              <h2>Welcome back 👨‍⚕️</h2>
              <p>You have appointment requests to manage</p>
            </div>
            <div className="welcome-icon">🩺</div>
          </div>

          {doctorProfile?.verification_status === "pending" && (
            <div style={{ background: "#FEF3C7", color: "#92400E", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
              <strong>⏳ Pending Approval:</strong> Your profile is currently under review by an administrator. You cannot accept or reject appointments until approved.
            </div>
          )}

          {doctorProfile?.verification_status === "rejected" && (
            <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
              <strong>❌ Application Rejected:</strong> {doctorProfile?.rejection_reason || "Please update your profile information and contact support."}
            </div>
          )}

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card-dash">
              <div className="icon">📋</div>
              <div className="number teal">{stats.total}</div>
              <div className="label">Total Appointments</div>
            </div>

            <div className="stat-card-dash">
              <div className="icon">⏳</div>
              <div className="number yellow">{stats.pending}</div>
              <div className="label">Pending</div>
            </div>

            <div className="stat-card-dash">
              <div className="icon">✅</div>
              <div className="number green">{stats.confirmed}</div>
              <div className="label">Confirmed</div>
            </div>

            <div className="stat-card-dash">
              <div className="icon">🏁</div>
              <div className="number">{stats.completed}</div>
              <div className="label">Completed</div>
            </div>

            <div className="stat-card-dash">
              <div className="icon">🗓️</div>
              <div className="number teal">{stats.availableDays}</div>
              <div className="label">Available Days</div>
            </div>
          </div>

          {/* Table */}
          <div className="table-card">
            <div className="table-header">
              <div className="table-title">Appointment Requests</div>

              <div className="filter-tabs" style={{ margin: 0 }}>
                <button onClick={() => setFilter("all")} className={`filter-tab ${filter === "all" ? "active" : ""}`}>all</button>
                <button onClick={() => setFilter("pending")} className={`filter-tab ${filter === "pending" ? "active" : ""}`}>pending</button>
                <button onClick={() => setFilter("confirmed")} className={`filter-tab ${filter === "confirmed" ? "active" : ""}`}>confirmed</button>
                <button onClick={() => setFilter("completed")} className={`filter-tab ${filter === "completed" ? "active" : ""}`}>completed</button>
                <button onClick={() => setFilter("rejected")} className={`filter-tab ${filter === "rejected" ? "active" : ""}`}>rejected</button>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Specialty</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="6">Loading...</td>
                  </tr>
                )}

                {error && (
                  <tr>
                    <td colSpan="6">{error}</td>
                  </tr>
                )}

                {!loading &&
                  !error &&
                  filteredAppointments.length === 0 && (
                    <tr>
                      <td colSpan="6">No appointments found for this filter.</td>
                    </tr>
                  )}

                {!loading &&
                  !error &&
                  filteredAppointments.map((app) => (
                    <tr key={app.id}>
                      <td>
                        <div className="table-avatar">
                          👤 {app.patientName}
                        </div>
                      </td>

                      <td className="table-specialty">
                        {app.specialty || app.type || "General"}
                      </td>

                      <td>{app.date}</td>
                      <td>{app.time}</td>

                      <td>
                        <span className={`status-badge badge-${app.status}`}>
                          {app.status}
                        </span>
                      </td>

                      <td>
                        {doctorProfile?.verification_status === "approved" ? (
                          <>
                            {app.status === "pending" && (
                              <div className="action-btns">
                                <button
                                  className="action-btn btn-accept"
                                  onClick={() =>
                                    handleStatusUpdate(app.id, "confirmed")
                                  }
                                >
                                  Accept
                                </button>

                                <button
                                  className="action-btn btn-reject"
                                  onClick={() =>
                                    handleStatusUpdate(app.id, "rejected")
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            )}

                            {app.status === "confirmed" && (
                              <button
                                className="action-btn btn-done"
                                onClick={() =>
                                  handleStatusUpdate(app.id, "completed")
                                }
                              >
                                Mark Done
                              </button>
                            )}

                            {(app.status === "completed" ||
                              app.status === "rejected") && (
                                <span className="no-action">—</span>
                              )}
                          </>
                        ) : (
                          <span className="no-action" title="Verify profile to manage appointments">🔒 Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="table-card" style={{ marginTop: "24px" }}>
            <div className="table-header">
              <div className="table-title">My Schedule</div>
            </div>

            <div style={{ padding: "16px", textAlign: "center" }}>
              <p style={{ marginBottom: "16px", color: "var(--text-secondary)" }}>
                You are currently available on <strong>{stats.availableDays}</strong> days of the week.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/doctor/schedule")}
              >
                Manage Weekly Schedule
              </button>
              {scheduleLoading && <p>Loading current schedule...</p>}

              {!scheduleLoading && schedule.length === 0 && !scheduleError && (
                <p>No availability has been configured yet.</p>
              )}

              {!scheduleLoading && schedule.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th>Day</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Slot</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map((item) => (
                      <tr key={item.id || `${item.dayOfWeek}-${item.startTime}`}>
                        <td>{item.dayName || dayOptions.find((d) => d.value === item.dayOfWeek)?.label || "-"}</td>
                        <td>{item.startTime}</td>
                        <td>{item.endTime}</td>
                        <td>{item.slotDuration} min</td>
                        <td>
                          <span className={`status-badge ${item.isAvailable ? "badge-confirmed" : "badge-rejected"}`}>
                            {item.isAvailable ? "Available" : "Not Available"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="table-card" style={{ marginTop: "24px" }}>
            <div className="table-header">
              <div className="table-title">Patient Reviews</div>
            </div>

            <div style={{ display: "flex", gap: "24px", marginBottom: "24px", alignItems: "center" }}>
              <div style={{ fontSize: "48px", fontWeight: "bold", color: "var(--primary-teal)" }}>
                {doctorProfile?.rating || "0.0"}
              </div>
              <div>
                <div style={{ fontSize: "20px", color: "#F59E0B" }}>
                  {"★".repeat(Math.round(doctorProfile?.rating || 0))}{"☆".repeat(5 - Math.round(doctorProfile?.rating || 0))}
                </div>
                <p style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                  Based on {doctorProfile?.reviews || 0} reviews
                </p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <div style={{ display: "grid", gap: "16px" }}>
                {reviews.map((review) => (
                  <div key={review.id} style={{ padding: "16px", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong>{review.patientName}</strong>
                      <span style={{ color: "#F59E0B" }}>{"★".repeat(review.rating)}</span>
                    </div>
                    <p style={{ color: "var(--text-main)", marginBottom: "8px" }}>{review.comment}</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "12px" }}>{review.daysAgo === 0 ? "Today" : `${review.daysAgo} days ago`}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}

export default DoctorDashboard;