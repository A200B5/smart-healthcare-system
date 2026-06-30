import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CardSkeleton from "../../components/loaders/CardSkeleton.jsx";
import PatientNavbar from "../../components/PatientNavbar.jsx";
import {
    getMyAppointments,
    cancelAppointment,
    getDoctorReviews,
    checkReviewStatus,
    submitReview,
} from "../../services/patientService.js";
import "./patient.css";
import ConfirmationModal from "../../components/ConfirmationModal.jsx";
import AlertModal from "../../components/AlertModal.jsx";

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
                    status: (a.status || "confirmed").toLowerCase(),
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

    // ── Confirmation Modal State ────────────────────────────────
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        appointmentId: null,
    });
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
        message: "",
    });

    // ── Cancel Appointment Handler ──────────────────────────────
    const handleCancelClick = (appointmentId) => {
        setConfirmModal({ isOpen: true, appointmentId });
    };

    const handleConfirmCancel = async () => {
        const appointmentId = confirmModal.appointmentId;
        setConfirmModal({ isOpen: false, appointmentId: null });
        if (!appointmentId) return;

        try {
            setCancellingId(appointmentId);
            setError(null);
            const res = await cancelAppointment(appointmentId);
            
            setAppointments((prev) => 
                prev.map(a => a.id === appointmentId ? { ...a, status: 'cancelled' } : a)
            );
            
            let alertMsg = "Appointment cancelled successfully.";
            if (res && res.refunded) {
                alertMsg += " Your payment has been refunded successfully.";
            }
            setAlertModal({ isOpen: true, message: alertMsg });
            
        } catch (err) {
            setError(err.message || "Failed to cancel appointment");
        } finally {
            setCancellingId(null);
        }
    };

    const handleCancelClose = () => {
        setConfirmModal({ isOpen: false, appointmentId: null });
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
                className="patient-review-star-btn"
                style={{ color: i <= rating ? "#f59e0b" : "#d1d5db" }}
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
                        {["all", "confirmed", "completed", "rejected"].map((status) => (
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
                        <div className="patient-home-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="patient-appt-list">
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="original-empty-state">

                            <p>No {filter === "all" ? "" : filter} appointments found</p>
                            <button
                                className="btn btn-primary patient-appt-mt"
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
                                        <div className="appt-detail-value"> {formatDate(appt.date)}</div>
                                    </div>
                                    <div className="appt-detail-item">
                                        <div className="appt-detail-label">Time</div>
                                        <div className="appt-detail-value"> {appt.time}</div>
                                    </div>
                                    <span className={`status-badge badge-${appt.status}`}>{appt.status}</span>
                                </div>

                                {/* Actions */}
                                <div className="patient-appt-actions">
                                    {/* Cancel for confirmed */}
                                    {(appt.status === "confirmed") && (
                                        <button
                                            className="btn-sm btn-sm-outline patient-btn-cancel-outline"
                                            onClick={() => handleCancelClick(appt.id)}
                                            disabled={cancellingId === appt.id}
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
                    className="modal-overlay patient-modal-overlay"
                    onClick={() => setReviewDoctor(null)}
                >
                    <div
                        className="modal-content patient-modal-content"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="patient-modal-header">
                            <h2 className="patient-modal-title">
                                Review Dr. {reviewDoctor.doctorName}
                            </h2>
                            <button
                                onClick={() => setReviewDoctor(null)}
                                className="patient-modal-close-btn"
                            >
                                ✕
                            </button>
                        </div>

                        {reviewCheckLoading ? (
                            <p className="patient-review-status-text">Checking review status...</p>
                        ) : hasReviewed ? (
                            <div className="patient-review-success-container">
                                <div className="patient-review-success-icon">✅</div>
                                <p className="patient-review-success-title">
                                    {reviewSuccess || "You have already reviewed this doctor."}
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitReview}>
                                <div className="patient-form-group">
                                    <label className="patient-modal-label">
                                        Rating
                                    </label>
                                    <div className="patient-review-stars-container">
                                        {renderStars(reviewForm.rating)}
                                    </div>
                                </div>
                                <div className="patient-form-group">
                                    <label className="patient-modal-label">
                                        Comment
                                    </label>
                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                                        placeholder="Share your experience with this doctor..."
                                        rows={4}
                                        className="patient-modal-textarea"
                                    />
                                </div>
                                {reviewError && (
                                    <p className="patient-error-text">
                                        ⚠️ {reviewError}
                                    </p>
                                )}
                                {reviewSuccess && (
                                    <p className="patient-success-text">
                                        ✅ {reviewSuccess}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    className="btn btn-primary patient-btn-full"
                                    disabled={reviewSubmitting}
                                >
                                    {reviewSubmitting ? "Submitting..." : "Submit Review"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ── Confirmation Modal ─────────────────────────────── */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                title="Cancel Appointment"
                message="Are you sure you want to cancel this appointment?&#10;&#10;If this appointment has already been paid, your payment will be refunded automatically."
                confirmText="Cancel Appointment"
                cancelText="Keep Appointment"
                onConfirm={handleConfirmCancel}
                onCancel={handleCancelClose}
                isDanger={true}
            />

            {/* ── Alert Modal ────────────────────────────────────── */}
            <AlertModal
                isOpen={alertModal.isOpen}
                title="Notice"
                message={alertModal.message}
                onClose={() => setAlertModal({ isOpen: false, message: "" })}
            />
        </>
    );
}

export default PatientAppointments;