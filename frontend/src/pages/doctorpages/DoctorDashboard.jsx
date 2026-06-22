import { useEffect, useState } from "react";
import DoctorNavbar from "../../components/DoctorNavbar.jsx";
import API from "../../services/axios.js";
import {
  getAppointments,
  updateAppointmentStatus,
} from "../../services/appointmentService";

const dayOptions = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const normalizeAppointments = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.appointments)
      ? payload.appointments
      : [];

  return list.map((app) => ({
    id: app.id || app._id,
    patientName: app.patientName || app.patient?.name || app.patient_name || "Unknown",
    specialty: app.specialty || app.type || app.doctorSpecialty || "General",
    date: app.date || app.appointmentDate || "-",
    time: app.time || app.appointmentTime || "-",
    status: (app.status || "pending").toLowerCase(),
  }));
};

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [doctorId, setDoctorId] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(true);
  const [scheduleError, setScheduleError] = useState(null);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState("");
  const [availabilityForm, setAvailabilityForm] = useState({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    isAvailable: true,
    slotDuration: 30,
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setScheduleLoading(true);
        setError(null);
        setScheduleError(null);

        const [appointmentsResult, scheduleResult] = await Promise.allSettled([
          getAppointments(),
          API.get("/availability/my-schedule"),
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

  const handleAvailabilitySubmit = async (e) => {
    e.preventDefault();
    setScheduleSuccess("");
    setScheduleError(null);

    if (!doctorId) {
      setScheduleError("Doctor profile ID is missing; availability cannot be updated.");
      return;
    }

    try {
      setSavingSchedule(true);
      await API.put(`/availability/doctors/${doctorId}/schedule`, {
        dayOfWeek: Number(availabilityForm.dayOfWeek),
        startTime: availabilityForm.startTime,
        endTime: availabilityForm.endTime,
        isAvailable: availabilityForm.isAvailable,
        slotDuration: Number(availabilityForm.slotDuration),
      });

      const refreshed = await API.get("/availability/my-schedule");
      const refreshedData = refreshed.data;
      setDoctorId(refreshedData?.doctorId || doctorId);
      setSchedule(Array.isArray(refreshedData?.schedule) ? refreshedData.schedule : []);
      setScheduleSuccess("Availability updated successfully.");
    } catch (err) {
      setScheduleError(err?.response?.data?.message || err.message || "Failed to update availability");
    } finally {
      setSavingSchedule(false);
    }
  };

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
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <div className="table-card" style={{ marginTop: "24px" }}>
            <div className="table-header">
              <div className="table-title">Manage Availability</div>
            </div>

            <form onSubmit={handleAvailabilitySubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Day</label>
                  <select
                    className="form-input"
                    value={availabilityForm.dayOfWeek}
                    onChange={(e) =>
                      setAvailabilityForm((prev) => ({
                        ...prev,
                        dayOfWeek: Number(e.target.value),
                      }))
                    }
                  >
                    {dayOptions.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Slot Duration (minutes)</label>
                  <select
                    className="form-input"
                    value={availabilityForm.slotDuration}
                    onChange={(e) =>
                      setAvailabilityForm((prev) => ({
                        ...prev,
                        slotDuration: Number(e.target.value),
                      }))
                    }
                  >
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={45}>45</option>
                    <option value={60}>60</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={availabilityForm.startTime}
                    onChange={(e) =>
                      setAvailabilityForm((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-input"
                    value={availabilityForm.endTime}
                    onChange={(e) =>
                      setAvailabilityForm((prev) => ({
                        ...prev,
                        endTime: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="checkbox-wrapper" style={{ marginBottom: "16px" }}>
                <input
                  type="checkbox"
                  id="availability-enabled"
                  checked={availabilityForm.isAvailable}
                  onChange={(e) =>
                    setAvailabilityForm((prev) => ({
                      ...prev,
                      isAvailable: e.target.checked,
                    }))
                  }
                />
                <label htmlFor="availability-enabled">Available on selected day</label>
              </div>

              <button type="submit" className="btn btn-primary" disabled={savingSchedule || scheduleLoading}>
                {savingSchedule ? "Saving..." : "Save Availability"}
              </button>
            </form>

            {scheduleError && <p style={{ marginTop: "12px", color: "var(--rejected)" }}>{scheduleError}</p>}
            {scheduleSuccess && <p style={{ marginTop: "12px", color: "var(--confirmed)" }}>{scheduleSuccess}</p>}

            <div style={{ marginTop: "16px" }}>
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
                            {item.isAvailable ? "available" : "off"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default DoctorDashboard;