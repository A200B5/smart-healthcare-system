import  { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProfileSkeleton from "../../components/loaders/ProfileSkeleton.jsx";

import PatientNavbar from "../../components/PatientNavbar.jsx";
import { getDoctorById } from "../../services/doctorService.js";
import { bookAppointment } from "../../services/appointmentService.js";
import { getAvailableSlots } from "../../services/patientService.js";
import "./patient.css";

function BookAppointment() {
    const { doctorId } = useParams();
    const navigate = useNavigate();

    const [doctor, setDoctor] = useState(null);

    const [formData, setFormData] = useState({
        date: "",
        time: "",
        notes: "",
    });

    const [doctorLoading, setDoctorLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [availableSlots, setAvailableSlots] = useState([]);
    const [slotsLoading, setSlotsLoading] = useState(false);

    const today = useMemo(() => {
        return new Date().toISOString().split("T")[0];
    }, []);

    useEffect(() => {
        const loadDoctor = async () => {
            try {
                setDoctorLoading(true);
                setError("");

                const data = await getDoctorById(doctorId);

                setDoctor(data.doctor);
            } catch (error) {
                setError(error.message || "Failed to load doctor details");
            } finally {
                setDoctorLoading(false);
            }
        };

        loadDoctor();
    }, [doctorId]);

    const normalizedDoctor = useMemo(() => {
        if (!doctor) return null;

        return {
            id: doctor.id || doctor.doctorId || doctorId,
            name:
                doctor.name ||
                doctor.doctorName ||
                doctor.fullName ||
                "Doctor",
            specialty: doctor.specialty || "General Practice",
            location:
                doctor.location ||
                doctor.hospital ||
                doctor.clinic ||
                "Clinic",
            rating: doctor.rating ?? 0,
            reviews: doctor.reviews ?? doctor.reviewCount ?? 0,
            experience: doctor.experience ?? 0,
            price: doctor.price ?? doctor.fee ?? 0,
            status:
                doctor.status ||
                (doctor.isAvailable === false || doctor.is_available === false
                    ? "busy"
                    : "available"),
            avatar: doctor.avatar || "👨‍⚕️",
            bio: doctor.bio || "",
        };
    }, [doctor, doctorId]);

    const isDoctorBusy = normalizedDoctor?.status === "busy";

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "date" ? { time: "" } : {}),
        }));

        setError("");
        setSuccess("");
    };

    useEffect(() => {
        const loadSlots = async () => {
            if (!formData.date || !doctorId) return;
            try {
                setSlotsLoading(true);
                const data = await getAvailableSlots(doctorId, formData.date);
                if (data && data.availableSlots) {
                    setAvailableSlots(data.availableSlots);
                } else {
                    setAvailableSlots([]);
                }
            } catch (error) {
                console.error("Failed to load slots", error);
                setAvailableSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        };

        if (formData.date) {
            loadSlots();
        }
    }, [formData.date, doctorId]);

    const handleSelectSlot = (slot) => {
        setFormData((prev) => ({
            ...prev,
            time: slot,
        }));

        setError("");
        setSuccess("");
    };

    const validateForm = () => {
        if (!formData.date) {
            setError("Please select appointment date");
            return false;
        }

        if (formData.date < today) {
            setError("Appointment date cannot be in the past");
            return false;
        }

        if (!formData.time) {
            setError("Please select appointment time");
            return false;
        }

        if (formData.notes.length > 500) {
            setError("Notes must not exceed 500 characters");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!validateForm()) return;

        try {
            setBookingLoading(true);

            const appointmentData = {
                doctorId: Number(doctorId),
                date: formData.date,
                time: formData.time,
                notes: formData.notes.trim(),
            };

            await bookAppointment(appointmentData);

            setSuccess("Appointment booked successfully");

            setTimeout(() => {
                navigate("/patient/appointment");
            }, 1200);
        } catch (error) {
            setError(error.message || "Failed to book appointment");
        } finally {
            setBookingLoading(false);
        }
    };

    if (doctorLoading) {
        return (
            <>
                <PatientNavbar />

                <div className="page" id="page-book-appointment">
                    <div className="page-content">
                        <ProfileSkeleton />
                    </div>
                </div>
            </>
        );
    }

    if (!normalizedDoctor) {
        return (
            <>
                <PatientNavbar />

                <section className="not-found-page booking-not-found-page">
                    {/* Decorative Elements */}
                    <div className="nf-plus nf-plus-1"></div>
                    <div className="nf-plus nf-plus-2"></div>
                    <div className="nf-plus nf-plus-3"></div>

                    <div className="nf-dots nf-dots-top"></div>
                    <div className="nf-dots nf-dots-bottom"></div>

                    <div className="nf-circle nf-circle-1"></div>
                    <div className="nf-circle nf-circle-2"></div>

                    {/* Content */}
                    <div className="not-found-content">
                        <div className="nf-icon-wrapper">
                            <span className="patient-nf-icon" >🩺</span>
                        </div>

                        <h1 className="nf-error-code">
                            404
                        </h1>

                        <h2 className="nf-title">
                            Doctor Not Found
                        </h2>

                        <p className="nf-description">
                            The doctor you are trying to book does not exist, may have been
                            removed, or the selected profile is no longer available.
                        </p>

                        <button
                            type="button"
                            className="nf-home-btn"
                            onClick={() => navigate("/patient/finddoctor")}
                        >
                            Back to Doctors
                        </button>
                    </div>
                </section>
            </>
        );
    }

    return (
        <>
            <PatientNavbar />

            <div className="page" id="page-book-appointment">
                <div className="page-content">
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">Book Appointment</h1>
                            <p className="page-subtitle">
                                Choose your preferred date and time with{" "}
                                {normalizedDoctor.name}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => navigate("/patient/finddoctor")}
                        >
                            ← Back to Doctors
                        </button>
                    </div>

                    <div className="booking-layout">
                        <aside className="booking-doctor-panel">
                            <div className="doctor-card booking-doctor-card">
                                <div className="doctor-header">
                                    <div className="doctor-avatar">
                                        {normalizedDoctor.avatar}
                                    </div>

                                    <div className="doctor-info">
                                        <div className="doctor-name">
                                            {normalizedDoctor.name}
                                        </div>

                                        <div className="doctor-specialty">
                                            {normalizedDoctor.specialty}
                                        </div>

                                        <div className="doctor-location">
                                            📍 {normalizedDoctor.location}
                                        </div>
                                    </div>

                                    <span
                                        className={`status-badge ${
                                            isDoctorBusy ? "status-busy" : "status-available"
                                        }`}
                                    >
                    {isDoctorBusy ? "○ Busy" : "● Available"}
                  </span>
                                </div>

                                <div className="doctor-stats">
                                    <div className="stat-item">
                                        <div className="stat-value">
                                            <span className="star">⭐</span>{" "}
                                            {normalizedDoctor.rating}
                                        </div>
                                        <div className="stat-label-sm">
                                            {normalizedDoctor.reviews} reviews
                                        </div>
                                    </div>

                                    <div className="stat-item">
                                        <div className="stat-value">
                                            {normalizedDoctor.experience}y
                                        </div>
                                        <div className="stat-label-sm">Experience</div>
                                    </div>

                                    <div className="stat-item">
                                        <div className="stat-value price">
                                            ${normalizedDoctor.price}
                                        </div>
                                        <div className="stat-label-sm">per visit</div>
                                    </div>
                                </div>

                                {normalizedDoctor.bio && (
                                    <p className="booking-doctor-bio">
                                        {normalizedDoctor.bio}
                                    </p>
                                )}
                            </div>

                            <div className="booking-help-card">
                                <div className="booking-help-icon">💡</div>

                                <div>
                                    <h3>Booking Tip</h3>
                                    <p>
                                        Select a future date, choose an available slot, then
                                        confirm your appointment.
                                    </p>
                                </div>
                            </div>
                        </aside>

                        <form className="booking-form-card" onSubmit={handleSubmit}>
                            <div className="table-header">
                                <div>
                                    <div className="table-title">Appointment Details</div>
                                    <p className="booking-form-subtitle">
                                        Fill in the information below to complete your booking.
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="error-msg show">
                                    ⚠️ <span>{error}</span>
                                </div>
                            )}

                            {success && (
                                <div className="success-msg show">
                                    ✅ <span>{success}</span>
                                </div>
                            )}

                            <div className="form-group">
                                <label className="form-label">Appointment Date</label>

                                <input
                                    type="date"
                                    name="date"
                                    className="form-input"
                                    value={formData.date}
                                    min={today}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Available Time Slots</label>

                                {!formData.date && (
                                    <p className="booking-muted-text">
                                        Select a date first to view available slots.
                                    </p>
                                )}

                                {formData.date && slotsLoading && (
                                    <p className="booking-muted-text">
                                        Loading available slots...
                                    </p>
                                )}

                                {formData.date && !slotsLoading && availableSlots.length === 0 && (
                                    <p className="booking-muted-text patient-booking-error">
                                        No available slots for this date.
                                    </p>
                                )}

                                {formData.date && !slotsLoading && availableSlots.length > 0 && (
                                    <div className="slots-grid">
                                        {availableSlots.map((slot) => (
                                            <button
                                                key={slot.time}
                                                type="button"
                                                className={`slot-btn ${
                                                    formData.time === slot.time ? "selected" : ""
                                                }`}
                                                onClick={() => !slot.isBooked && handleSelectSlot(slot.time)}
                                                disabled={slot.isBooked}
                                                style={{ opacity: slot.isBooked ? 0.5 : 1, cursor: slot.isBooked ? "not-allowed" : "pointer" }}
                                            >
                                                {slot.time}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Notes</label>

                                <textarea
                                    name="notes"
                                    className="form-input booking-textarea"
                                    placeholder="Describe your symptoms or reason for visit..."
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="4"
                                    maxLength="500"
                                />

                                <div className="booking-char-count">
                                    {formData.notes.length}/500
                                </div>
                            </div>

                            <div className="booking-summary">
                                <div className="summary-row">
                                    <span>Doctor</span>
                                    <strong>{normalizedDoctor.name}</strong>
                                </div>

                                <div className="summary-row">
                                    <span>Specialty</span>
                                    <strong>{normalizedDoctor.specialty}</strong>
                                </div>

                                <div className="summary-row">
                                    <span>Date</span>
                                    <strong>{formData.date || "Not selected"}</strong>
                                </div>

                                <div className="summary-row">
                                    <span>Time</span>
                                    <strong>{formData.time || "Not selected"}</strong>
                                </div>

                                <div className="summary-row total">
                                    <span>Consultation Fee</span>
                                    <strong>${normalizedDoctor.price}</strong>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-auth"
                                disabled={
                                    bookingLoading ||
                                    !formData.date ||
                                    !formData.time ||
                                    isDoctorBusy
                                }
                            >
                                {bookingLoading ? "Booking..." : "Confirm Appointment"}
                            </button>

                            {isDoctorBusy && (
                                <p className="booking-warning">
                                    This doctor is currently busy and cannot accept new bookings.
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default BookAppointment;