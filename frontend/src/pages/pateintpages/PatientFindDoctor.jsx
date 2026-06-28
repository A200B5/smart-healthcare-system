import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import CardSkeleton from "../../components/loaders/CardSkeleton.jsx";
import PatientNavbar from "../../components/PatientNavbar.jsx";
import {
    getDoctors,
    getDoctorById,
    getDoctorReviews,
    checkReviewStatus,
    getAvailableSlots,
    bookAppointment,
} from "../../services/patientService.js";

function PatientFindDoctor() {
    const navigate = useNavigate();

    // ── Doctor List State ─────────────────────────────────
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [specialtyFilter, setSpecialtyFilter] = useState("All");
    const [sortBy, setSortBy] = useState("Top Rated");
    const [availableOnly, setAvailableOnly] = useState(false);

    // ── Doctor Detail Modal State ─────────────────────────
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [doctorReviews, setDoctorReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    // ── Booking Modal State ───────────────────────────────
    const [bookingDoctor, setBookingDoctor] = useState(null);
    const [bookingDate, setBookingDate] = useState("");
    const [bookingSlots, setBookingSlots] = useState([]);
    const [bookingSlotsLoading, setBookingSlotsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState("");
    const [bookingNotes, setBookingNotes] = useState("");
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [bookingError, setBookingError] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState("");

    // ── Load Doctors ──────────────────────────────────────
    useEffect(() => {
        const loadDoctors = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getDoctors();
                setDoctors(data?.doctors || []);
            } catch (err) {
                setError(err.message || "Failed to load doctors");
                setDoctors([]);
            } finally {
                setLoading(false);
            }
        };
        loadDoctors();
    }, []);

    // ── Derived: specialties for filter dropdown ──────────
    const specialties = ["All", ...new Set(doctors.map((d) => d.specialty).filter(Boolean))];

    // ── Filtering & Sorting ──────────────────────────────
    const filteredDoctors = doctors
        .filter((d) => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                !term ||
                (d.name || "").toLowerCase().includes(term) ||
                (d.specialty || "").toLowerCase().includes(term);
            const matchesSpecialty = specialtyFilter === "All" || d.specialty === specialtyFilter;
            const matchesAvailable = !availableOnly || d.available;
            return matchesSearch && matchesSpecialty && matchesAvailable;
        })
        .sort((a, b) => {
            if (sortBy === "Top Rated") return (b.rating || 0) - (a.rating || 0);
            if (sortBy === "Most Experience") return (b.experience || 0) - (a.experience || 0);
            if (sortBy === "Lowest Price") return (a.price || 0) - (b.price || 0);
            return 0;
        });

    // ── View Profile Handler ─────────────────────────────
    const handleViewProfile = async (doctor) => {
        setSelectedDoctor(doctor);
        setDoctorReviews([]);

        try {
            setReviewsLoading(true);
            const reviewsData = await getDoctorReviews(doctor.id);
            setDoctorReviews(reviewsData?.reviews || []);
        } catch (err) {
            console.error("Failed to load doctor details:", err);
        } finally {
            setReviewsLoading(false);
        }
    };

    // ── Book Now Handler ─────────────────────────────────
    const handleBookNow = (doctor) => {
        setBookingDoctor(doctor);
        setBookingDate("");
        setBookingSlots([]);
        setSelectedSlot("");
        setBookingNotes("");
        setBookingError(null);
        setBookingSuccess("");
    };

    // ── Load Slots When Date Changes ─────────────────────
    const handleDateChange = async (date) => {
        setBookingDate(date);
        setSelectedSlot("");
        setBookingSlots([]);
        setBookingError(null);

        if (!date || !bookingDoctor) return;

        try {
            setBookingSlotsLoading(true);
            const data = await getAvailableSlots(bookingDoctor.id, date);
            const slots = (data?.availableSlots || []).filter((s) => !s.isBooked);
            setBookingSlots(slots);
            if (slots.length === 0) {
                setBookingError("No available slots for this date. Please try another date.");
            }
        } catch (err) {
            setBookingError(err.message || "Failed to load available slots");
            setBookingSlots([]);
        } finally {
            setBookingSlotsLoading(false);
        }
    };

    // ── Submit Booking Handler ────────────────────────────
    const handleSubmitBooking = async (e) => {
        e.preventDefault();
        if (!bookingDoctor || !bookingDate || !selectedSlot) return;

        try {
            setBookingSubmitting(true);
            setBookingError(null);
            setBookingSuccess("");

            await bookAppointment({
                doctorId: bookingDoctor.id,
                date: bookingDate,
                time: selectedSlot,
                notes: bookingNotes,
            });

            setBookingSuccess("Appointment booked successfully!");
            setTimeout(() => {
                setBookingDoctor(null);
                setBookingSuccess("");
            }, 2000);
        } catch (err) {
            setBookingError(err.message || "Failed to book appointment");
        } finally {
            setBookingSubmitting(false);
        }
    };

    // ── Today's date for min date input ───────────────────
    const today = new Date().toISOString().split("T")[0];

    // ── Render Stars ──────────────────────────────────────
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} style={{ color: i <= rating ? "#f59e0b" : "#d1d5db", fontSize: "16px" }}>
                    ★
                </span>
            );
        }
        return stars;
    };

    return (
        <>
            <PatientNavbar />
            <div className="page" id="page-patient-doctors">
                <div className="page-content">
                    <h1 className="page-title">Find Your Doctor</h1>
                    <p className="page-subtitle">
                        Browse our network of {doctors.length} verified specialists
                    </p>

                    <div className="filters-bar">
                        <div className="filter-group">
                            <label className="filter-label">Search</label>
                            <input
                                type="text"
                                className="filter-input"
                                placeholder="Search by name or specialty..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Specialty</label>
                            <select
                                className="filter-select"
                                value={specialtyFilter}
                                onChange={(e) => setSpecialtyFilter(e.target.value)}
                            >
                                {specialties.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">Sort By</label>
                            <select
                                className="filter-select"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option>Top Rated</option>
                                <option>Most Experience</option>
                                <option>Lowest Price</option>
                            </select>
                        </div>
                        <div className="checkbox-wrapper">
                            <input
                                type="checkbox"
                                id="available"
                                checked={availableOnly}
                                onChange={(e) => setAvailableOnly(e.target.checked)}
                            />
                            <label htmlFor="available">Available Only</label>
                        </div>
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

                    {loading ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </div>
                    ) : (
                        <>
                            <p className="showing-count">
                                Showing <strong>{filteredDoctors.length}</strong> doctor{filteredDoctors.length !== 1 ? "s" : ""}
                            </p>

                            {filteredDoctors.length === 0 && !error ? (
                                <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-secondary)" }}>
                                    <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                                    <p>No doctors found matching your criteria</p>
                                </div>
                            ) : (
                                <div className="doctors-grid">
                                    {filteredDoctors.map((doctor) => (
                                        <div className="doctor-card" key={doctor.id}>
                                            <div className="doctor-header">
                                                <div className="doctor-avatar">
                                                    {doctor.avatar || "👨‍⚕️"}
                                                </div>
                                                <div className="doctor-info">
                                                    <div className="doctor-name">{doctor.name || "Doctor"}</div>
                                                    <div className="doctor-specialty">{doctor.specialty || "General"}</div>
                                                    <div className="doctor-location">📍 {doctor.location || "N/A"}</div>
                                                </div>
                                                <span className={`status-badge ${doctor.available ? "status-available" : "status-busy"}`}>
                                                    {doctor.available ? "● Available" : "○ Busy"}
                                                </span>
                                            </div>
                                            <div className="doctor-stats">
                                                <div className="stat-item">
                                                    <div className="stat-value">
                                                        <span className="star">⭐</span> {Number(doctor.rating || 0).toFixed(1)}
                                                    </div>
                                                    <div className="stat-label-sm">{doctor.reviews || 0} reviews</div>
                                                </div>
                                                <div className="stat-item">
                                                    <div className="stat-value">{doctor.experience || 0}y</div>
                                                    <div className="stat-label-sm">Experience</div>
                                                </div>
                                                <div className="stat-item">
                                                    <div className="stat-value price">${Number(doctor.price || 0).toFixed(0)}</div>
                                                    <div className="stat-label-sm">per visit</div>
                                                </div>
                                            </div>
                                            <div className="doctor-actions">
                                                <button
                                                    className="btn-sm btn-sm-outline"
                                                    onClick={() => handleViewProfile(doctor)}
                                                >
                                                    View Profile
                                                </button>
                                                {doctor.available && (
                                                    <button
                                                        className="btn-sm btn-sm-primary"
                                                        onClick={() => handleBookNow(doctor)}
                                                    >
                                                        Book Now
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* ── Doctor Detail Modal ──────────────────────────── */}
            {selectedDoctor && (
                <div className="modal-overlay" onClick={() => setSelectedDoctor(null)} style={modalOverlayStyle}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={modalContentStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ margin: 0, fontSize: "22px", color: "var(--text-primary)" }}>Doctor Profile</h2>
                            <button onClick={() => setSelectedDoctor(null)} style={closeButtonStyle}>✕</button>
                        </div>

                        {/* Doctor Info */}
                        <div style={{ display: "flex", gap: "16px", marginBottom: "20px", alignItems: "center" }}>
                            <div style={{ fontSize: "48px" }}>{selectedDoctor.avatar || "👨‍⚕️"}</div>
                            <div>
                                <h3 style={{ margin: "0 0 4px 0", fontSize: "20px", color: "var(--text-primary)" }}>{selectedDoctor.name}</h3>
                                <p style={{ margin: "0 0 4px 0", color: "var(--accent)", fontWeight: 500 }}>{selectedDoctor.specialty}</p>
                                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px" }}>📍 {selectedDoctor.location || "N/A"}</p>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                            <div style={statBoxStyle}>
                                <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>⭐ {Number(selectedDoctor.rating || 0).toFixed(1)}</div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{selectedDoctor.reviews || 0} reviews</div>
                            </div>
                            <div style={statBoxStyle}>
                                <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{selectedDoctor.experience || 0} years</div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Experience</div>
                            </div>
                            <div style={statBoxStyle}>
                                <div style={{ fontWeight: 700, color: "var(--accent)" }}>${Number(selectedDoctor.price || 0).toFixed(0)}</div>
                                <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>per visit</div>
                            </div>
                        </div>

                        {selectedDoctor.bio && (
                            <div style={{ marginBottom: "20px" }}>
                                <h4 style={{ margin: "0 0 8px 0", color: "var(--text-primary)" }}>About</h4>
                                <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "14px", lineHeight: "1.6" }}>{selectedDoctor.bio}</p>
                            </div>
                        )}

                        {/* Book button */}
                        {selectedDoctor.available && (
                            <button
                                className="btn btn-primary"
                                style={{ width: "100%", marginBottom: "20px" }}
                                onClick={() => {
                                    setSelectedDoctor(null);
                                    handleBookNow(selectedDoctor);
                                }}
                            >
                                Book Appointment
                            </button>
                        )}

                        {/* Reviews Section */}
                        <div style={{ borderTop: "1px solid var(--border-color, #e2e8f0)", paddingTop: "16px" }}>
                            <h4 style={{ margin: "0 0 12px 0", color: "var(--text-primary)" }}>
                                Patient Reviews ({doctorReviews.length})
                            </h4>

                            {reviewsLoading ? (
                                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Loading reviews...</p>
                            ) : doctorReviews.length === 0 ? (
                                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>No reviews yet.</p>
                            ) : (
                                <div style={{ maxHeight: "200px", overflowY: "auto", marginBottom: "16px" }}>
                                    {doctorReviews.map((review) => (
                                        <div key={review.id} style={{
                                            padding: "12px",
                                            marginBottom: "8px",
                                            background: "var(--bg-secondary, #f8fafc)",
                                            borderRadius: "8px",
                                            fontSize: "14px"
                                        }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                                <strong style={{ color: "var(--text-primary)" }}>{review.patientName || "Anonymous"}</strong>
                                                <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                                                    {review.daysAgo != null ? (review.daysAgo === 0 ? "Today" : `${review.daysAgo}d ago`) : ""}
                                                </span>
                                            </div>
                                            <div style={{ marginBottom: "6px" }}>{renderStars(review.rating)}</div>
                                            {review.comment && (
                                                <p style={{ margin: 0, color: "var(--text-secondary)" }}>{review.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Booking Modal ─────────────────────────────── */}
            {bookingDoctor && (
                <div className="modal-overlay" onClick={() => setBookingDoctor(null)} style={modalOverlayStyle}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ ...modalContentStyle, maxWidth: "500px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ margin: 0, fontSize: "22px", color: "var(--text-primary)" }}>Book Appointment</h2>
                            <button onClick={() => setBookingDoctor(null)} style={closeButtonStyle}>✕</button>
                        </div>

                        {/* Doctor summary */}
                        <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", padding: "12px", background: "var(--bg-secondary, #f8fafc)", borderRadius: "8px" }}>
                            <div style={{ fontSize: "36px" }}>{bookingDoctor.avatar || "👨‍⚕️"}</div>
                            <div>
                                <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{bookingDoctor.name}</div>
                                <div style={{ color: "var(--accent)", fontSize: "14px" }}>{bookingDoctor.specialty}</div>
                                <div style={{ color: "var(--text-secondary)", fontSize: "13px" }}>${Number(bookingDoctor.price || 0).toFixed(0)} per visit</div>
                            </div>
                        </div>

                        {bookingSuccess ? (
                            <div style={{ textAlign: "center", padding: "40px 0" }}>
                                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                                <p style={{ color: "var(--confirmed, #22c55e)", fontWeight: 600, fontSize: "18px" }}>{bookingSuccess}</p>
                                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>You will be redirected shortly...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmitBooking}>
                                {/* Date */}
                                <div style={{ marginBottom: "16px" }}>
                                    <label style={labelStyle}>Select Date</label>
                                    <input
                                        type="date"
                                        value={bookingDate}
                                        min={today}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        required
                                        style={inputStyle}
                                    />
                                </div>

                                {/* Time Slots */}
                                {bookingDate && (
                                    <div style={{ marginBottom: "16px" }}>
                                        <label style={labelStyle}>Available Time Slots</label>
                                        {bookingSlotsLoading ? (
                                            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Loading slots...</p>
                                        ) : bookingSlots.length === 0 ? (
                                            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                                                No available slots for this date.
                                            </p>
                                        ) : (
                                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                                                {bookingSlots.map((slot) => (
                                                    <button
                                                        key={slot.time}
                                                        type="button"
                                                        onClick={() => setSelectedSlot(slot.time)}
                                                        style={{
                                                            padding: "10px 8px",
                                                            border: selectedSlot === slot.time ? "2px solid var(--accent, #0ea5e9)" : "1px solid var(--border-color, #e2e8f0)",
                                                            background: selectedSlot === slot.time ? "rgba(14, 165, 233, 0.1)" : "var(--bg-secondary, #f8fafc)",
                                                            borderRadius: "8px",
                                                            cursor: "pointer",
                                                            fontSize: "14px",
                                                            fontWeight: selectedSlot === slot.time ? 600 : 400,
                                                            color: "var(--text-primary)",
                                                            transition: "all 0.2s",
                                                        }}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Notes */}
                                <div style={{ marginBottom: "16px" }}>
                                    <label style={labelStyle}>Notes (optional)</label>
                                    <textarea
                                        value={bookingNotes}
                                        onChange={(e) => setBookingNotes(e.target.value)}
                                        placeholder="Describe your symptoms or reason for visit..."
                                        rows={3}
                                        style={textareaStyle}
                                    />
                                </div>

                                {bookingError && <p style={{ color: "var(--rejected, #ef4444)", fontSize: "13px", margin: "0 0 12px 0" }}>⚠️ {bookingError}</p>}

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={bookingSubmitting || !bookingDate || !selectedSlot}
                                    style={{ width: "100%" }}
                                >
                                    {bookingSubmitting ? "Booking..." : "Confirm Booking"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

// ── Inline Styles for Modals ─────────────────────────────────
const modalOverlayStyle = {
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
};

const modalContentStyle = {
    background: "var(--bg-primary, #ffffff)",
    borderRadius: "16px",
    padding: "24px",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "85vh",
    overflowY: "auto",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
};

const closeButtonStyle = {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    color: "var(--text-secondary)",
    padding: "4px 8px",
    borderRadius: "4px",
};

const statBoxStyle = {
    textAlign: "center",
    padding: "12px",
    background: "var(--bg-secondary, #f8fafc)",
    borderRadius: "8px",
};

const labelStyle = {
    display: "block",
    marginBottom: "6px",
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--text-secondary)",
};

const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid var(--border-color, #e2e8f0)",
    borderRadius: "8px",
    fontSize: "14px",
    background: "var(--bg-secondary, #f8fafc)",
    color: "var(--text-primary)",
    boxSizing: "border-box",
};

const textareaStyle = {
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
};

export default PatientFindDoctor;