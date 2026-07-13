import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DoctorNavbar from "../../components/DoctorNavbar.jsx";
import API from "../../services/axios.js";
import {
  getAppointments,
  updateAppointmentStatus,
} from "../../services/appointmentService";
import { getDoctorProfile, getDoctorReviews } from "../../services/doctorService";
import { useAuth } from "../../context/AuthContext.jsx";
import "./doctor.css";

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
      status: (app.status || "confirmed").toLowerCase(),
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
  const { user } = useAuth();
  const doctorName = user?.name || "Doctor";

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
              <h2>Welcome back, Dr. {doctorName}</h2>
              <p>You have appointment requests to manage</p>
            </div>
            <div className="welcome-icon">🩺</div>
          </div>

          {doctorProfile?.verification_status === "pending" && (
            <div className="doctor-dashboard-alert-pending">
              <strong>⏳ Pending Approval:</strong> Your profile is currently under review by an administrator. You cannot accept or reject appointments until approved.
            </div>
          )}

          {doctorProfile?.verification_status === "rejected" && (
            <div className="doctor-dashboard-alert-rejected">
              <strong>❌ Application Rejected:</strong> {doctorProfile?.rejection_reason || "Please update your profile information and contact support."}
            </div>
          )}

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card-dash">

              <div className="number teal">{stats.total}</div>
              <div className="label">Total Appointments</div>
            </div>



            <div className="stat-card-dash">

              <div className="number green">{stats.confirmed}</div>
              <div className="label">Confirmed</div>
            </div>

            <div className="stat-card-dash">
              <div className="number doctor-dashboard-stat-completed">{stats.completed}</div>
              <div className="label">Completed</div>
            </div>

            <div className="stat-card-dash">

              <div className="number teal">{stats.availableDays}</div>
              <div className="label">Available Days</div>
            </div>
          </div>

          {/* Table */}
          <div className="table-card">
            <div className="table-header">
              <div className="table-title">Appointment Requests</div>

              <div className="filter-tabs doctor-dashboard-filter-tabs">
                <button onClick={() => setFilter("all")} className={`filter-tab ${filter === "all" ? "active" : ""}`}>all</button>

                <button onClick={() => setFilter("confirmed")} className={`filter-tab ${filter === "confirmed" ? "active" : ""}`}>confirmed</button>
                <button onClick={() => setFilter("completed")} className={`filter-tab ${filter === "completed" ? "active" : ""}`}>completed</button>
                <button onClick={() => setFilter("cancelled")} className={`filter-tab ${filter === "cancelled" ? "active" : ""}`}>cancelled</button>
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
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`sk-${i}`}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={`sk-td-${i}-${j}`}>
                          <div className="skeleton skeleton-text doctor-dashboard-skeleton" style={{ width: j === 0 ? '80%' : '50%' }}></div>
                        </td>
                      ))}
                    </tr>
                  ))
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
                              app.status === "cancelled") && (
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

          <div className="table-card doctor-dashboard-section">
            <div className="table-header">
              <div className="table-title">My Schedule</div>
            </div>

            <div className="doctor-dashboard-schedule-info">
              <p className="doctor-dashboard-schedule-text">
                You are currently available on <strong>{stats.availableDays}</strong> days of the week.
              </p>
              <button
                className="btn btn-primary doctor-dashboard-schedule-btn"
                onClick={() => navigate("/doctor/schedule")}
              >
                Manage Weekly Schedule
              </button>
              {scheduleLoading && (
                <div className="doctor-dashboard-schedule-loader">
                  <div className="skeleton skeleton-text doctor-dashboard-schedule-skeleton"></div>
                  <div className="skeleton skeleton-text doctor-dashboard-schedule-skeleton"></div>
                </div>
              )}

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
          <div className="table-card doctor-dashboard-section">
            <div className="table-header">
              <div className="table-title">Patient Reviews</div>
            </div>

            <div className="doctor-dashboard-reviews-summary">
              <div className="doctor-dashboard-reviews-rating">
                {doctorProfile?.rating || "0.0"}
              </div>
              <div>
                <div className="doctor-dashboard-reviews-stars">
                  {"★".repeat(Math.round(doctorProfile?.rating || 0))}{"☆".repeat(5 - Math.round(doctorProfile?.rating || 0))}
                </div>
                <p className="doctor-dashboard-reviews-count">
                  Based on {doctorProfile?.reviews || 0} reviews
                </p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <div className="doctor-dashboard-reviews-grid">
                {reviews.map((review) => (
                  <div key={review.id} className="doctor-dashboard-review-card">
                    <div className="doctor-dashboard-review-header">
                      <strong>{review.patientName}</strong>
                      <span className="doctor-dashboard-review-stars-color">{"★".repeat(review.rating)}</span>
                    </div>
                    <p className="doctor-dashboard-review-text">{review.comment}</p>
                    <p className="doctor-dashboard-review-date">{review.daysAgo === 0 ? "Today" : `${review.daysAgo} days ago`}</p>
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