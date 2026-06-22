import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PatientNavbar from "../../components/PatientNavbar.jsx";
import {
    getMyAppointments,
    cancelAppointment,
    getDoctorReviews,
    checkReviewStatus,
    submitReview,
} from "../../services/patientService.js";

function PatientAppointments() {
    const navigate = useNavigate();

    // ── Appointments State ────────────────────────────────
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [cancellingId, setCancellingId] = useState(null);

    // ── Review Modal State ────────────────────────────────
    const [reviewDoctor, setReviewDoctor] = useState(null); // { doctorId, doctorName }
    const [hasReviewed, setHasReviewed] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState(null);
    const [reviewSuccess, setReviewSuccess] = useState("");
    const [reviewCheckLoading, setReviewCheckLoading] = useState(false);

    // ── Load Appointments ─────────────────────────────────
    const loadAppointments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getMyAppointments();
            const list = data?.appointments || [];
            setAppointments(
                list.map((a) => ({
                    id: a.id || a._id,
                    doctorName: a.doctorName || a.doctor_name || "Doctor",
                    doctorSpecialty: a.doctorSpecialty || a.specialty || "General",
                    doctorId: a.doctorId || a.doctor_id,
                    date: a.date || "-",
                    time: a.time || "-",
                    status: (a.status || "pending").toLowerCase(),
                    notes: a.notes || "",
                }))
            );
        } catch (err) {
            setError(err.message || "Failed to load appointments");
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    // ── Cancel Appointment Handler ────────────────────────
    const handleCancel = async (appointmentId) => {
        if (!window.confirm("Are you sure you want to cancel this appointment?")) return;

        try {
            setCancellingId(appointmentId);
            setError(null);
            await cancelAppointment(appointmentId);
            setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
        } catch (err) {
            setError(err.message || "Failed to cancel appointment");
        } finally {
            setCancellingId(null);
        }
    };

    // ── Review Handler ────────────────────────────────────
    const handleOpenReview = async (appointment) => {
        setReviewDoctor({
            doctorId: appointment.doctorId,
            doctorName: appointment.doctorName,
        });
        setHasReviewed(false);
        setReviewForm({ rating: 5, comment: "" });
        setReviewError(null);
        setReviewSuccess("");

        if (appointment.doctorId) {
            try {
                setReviewCheckLoading(true);
                const status = await checkReviewStatus(appointment.doctorId);
                setHasReviewed(status?.hasReviewed || false);
            } catch (err) {
                console.error("Failed to check review status:", err);
            } finally {
                setReviewCheckLoading(false);
            }
        }
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!reviewDoctor?.doctorId) return;

        try {
            setReviewSubmitting(true);
            setReviewError(null);
            setReviewSuccess("");

            await submitReview({
                doctorId: reviewDoctor.doctorId,
                rating: reviewForm.rating,
                comment: reviewForm.comment,
            });

            setReviewSuccess("Review submitted successfully!");
            setHasReviewed(true);
        } catch (err) {
            setReviewError(err.message || "Failed to submit review");
        } finally {
            setReviewSubmitting(false);
        }
    };

    // ── Filtering ─────────────────────────────────────────
    const filteredAppointments =
        filter === "all"
            ? appointments
            : appointments.filter((a) => a.status === filter);

    const statusCounts = {
        all: appointments.length,
        pending: appointments.filter((a) => a.status === "pending").length,
        confirmed: appointments.filter((a) => a.status === "confirmed").length,
        completed: appointments.filter((a) => a.status === "completed").length,
        rejected: appointments.filter((a) => a.status === "rejected").length,
    };

    // ── Format Date ───────────────────────────────────────
    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "-") return "-";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        } catch {
            return dateStr;
        }
    };

    // ── Render Stars ──────────────────────────────────────
    const renderStars = (rating) => {
        return [1, 2, 3, 4, 5].map((i) => (
            <button
                key={i}
                type="button"
                onClick={() => setReviewForm((prev) => ({ ...prev, rating: i }))}
                style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "24px",
                    color: i <= rating ? "#f59e0b" : "#d1d5db",
                    padding: "2px",
                }}
            >
                ★
            </button>
        ));
    };

    return (
        <>
            <PatientNavbar />
            <div className="page" id="page-patient-appointments">
                <div className="page-content">
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">My Appointments</h1>
                            <p className="page-subtitle">Track and manage all your medical appointments</p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/patient/finddoctor")}
                        >
                            + Book New Appointment
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="filter-tabs">
                        {["all", "pending", "confirmed", "completed", "rejected"].map((status) => (
                            <button
                                key={status}
                                className={`filter-tab ${filter === status ? "active" : ""}`}
                                onClick={() => setFilter(status)}
                            >
                                {status} ({statusCounts[status]})
                            </button>
                        ))}
                    </div>

                    {/* Error */}
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

                    {/* Loading */}
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
                            <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
                            <p>Loading appointments...</p>
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
                            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
                            <p>No {filter === "all" ? "" : filter} appointments found</p>
                            <button
                                className="btn btn-primary"
                                style={{ marginTop: "16px" }}
                                onClick={() => navigate("/patient/finddoctor")}
                            >
                                Book Your First Appointment
                            </button>
                        </div>
                    ) : (
                        filteredAppointments.map((appt) => (
                            <div className={`appointment-card ${appt.status}`} key={appt.id}>
                                <div className="appt-doctor">
                                    <div className="appt-avatar">👨‍⚕️</div>
                                    <div>
                                        <div className="appt-name">{appt.doctorName}</div>
                                        <div className="appt-specialty">{appt.doctorSpecialty}</div>
                                    </div>
                                </div>
                                <div className="appt-details">
                                    <div className="appt-detail-item">
                                        <div className="appt-detail-label">Date</div>
                                        <div className="appt-detail-value">📅 {formatDate(appt.date)}</div>
                                    </div>
                                    <div className="appt-detail-item">
                                        <div className="appt-detail-label">Time</div>
                                        <div className="appt-detail-value">🕐 {appt.time}</div>
                                    </div>
                                    <span className={`status-badge badge-${appt.status}`}>{appt.status}</span>
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                                    {/* Cancel for pending/confirmed */}
                                    {(appt.status === "pending" || appt.status === "confirmed") && (
                                        <button
                                            className="btn-sm btn-sm-outline"
                                            onClick={() => handleCancel(appt.id)}
                                            disabled={cancellingId === appt.id}
                                            style={{
                                                color: "var(--rejected, #ef4444)",
                                                borderColor: "var(--rejected, #ef4444)",
                                            }}
                                        >
                                            {cancellingId === appt.id ? "Cancelling..." : "✕ Cancel"}
                                        </button>
                                    )}

                                    {/* Review for completed */}
                                    {appt.status === "completed" && appt.doctorId && (
                                        <button
                                            className="btn-sm btn-sm-primary"
                                            onClick={() => handleOpenReview(appt)}
                                        >
                                            ⭐ Leave Review
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── Review Modal ─────────────────────────────── */}
            {reviewDoctor && (
                <div
                    className="modal-overlay"
                    onClick={() => setReviewDoctor(null)}
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: "rgba(0, 0, 0, 0.5)",
                        backdropFilter: "blur(4px)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        padding: "20px",
                    }}
                >
                    <div
                        className="modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: "var(--bg-primary, #ffffff)",
                            borderRadius: "16px",
                            padding: "24px",
                            maxWidth: "480px",
                            width: "100%",
                            maxHeight: "85vh",
                            overflowY: "auto",
                            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ margin: 0, fontSize: "22px", color: "var(--text-primary)" }}>
                                Review Dr. {reviewDoctor.doctorName}
                            </h2>
                            <button
                                onClick={() => setReviewDoctor(null)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "20px",
                                    cursor: "pointer",
                                    color: "var(--text-secondary)",
                                    padding: "4px 8px",
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        {reviewCheckLoading ? (
                            <p style={{ color: "var(--text-secondary)", textAlign: "center" }}>Checking review status...</p>
                        ) : hasReviewed ? (
                            <div style={{ textAlign: "center", padding: "20px 0" }}>
                                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                                <p style={{ color: "var(--confirmed, #22c55e)", fontWeight: 600, fontSize: "16px" }}>
                                    {reviewSuccess || "You have already reviewed this doctor."}
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitReview}>
                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>
                                        Rating
                                    </label>
                                    <div style={{ display: "flex", gap: "4px" }}>
                                        {renderStars(reviewForm.rating)}
                                    </div>
                                </div>
                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>
                                        Comment
                                    </label>
                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                                        placeholder="Share your experience with this doctor..."
                                        rows={4}
                                        style={{
                                            width: "100%",
                                            padding: "10px 12px",
                                            border: "1px solid var(--border-color, #e2e8f0)",
                                            borderRadius: "8px",
                                            fontSize: "14px",
                                            background: "var(--bg-secondary, #f8fafc)",
                                            color: "var(--text-primary)",
                                            resize: "vertical",
                                            fontFamily: "inherit",
                                            boxSizing: "border-box",
                                        }}
                                    />
                                </div>
                                {reviewError && (
                                    <p style={{ color: "var(--rejected, #ef4444)", fontSize: "13px", margin: "0 0 12px 0" }}>
                                        ⚠️ {reviewError}
                                    </p>
                                )}
                                {reviewSuccess && (
                                    <p style={{ color: "var(--confirmed, #22c55e)", fontSize: "13px", margin: "0 0 12px 0" }}>
                                        ✅ {reviewSuccess}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={reviewSubmitting}
                                    style={{ width: "100%" }}
                                >
                                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default PatientAppointments;