import { useState, useEffect } from "react";
import ProfileSkeleton from "../../components/loaders/ProfileSkeleton.jsx";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import { getDoctorById, updateDoctor } from "../../services/adminService.js";
import { toast } from "react-toastify";
import SaveButton from "../../components/SaveButton.jsx";
import { useFormState } from "../../services/formUtils.js";
import "./admin.css";

function AdminDoctorDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [initialForm, setInitialForm] = useState({
        price: 0,
        experience: 0,
        available: false,
        bio: ''
    });

    const { formData, setFormData, handleChange, isDirty, syncSavedData } = useFormState(initialForm);

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await getDoctorById(id);
                if (res && res.success) {
                    setDoctor(res.doctor);
                    setInitialForm({
                        price: res.doctor.price || 0,
                        experience: res.doctor.experience || 0,
                        available: !!res.doctor.available,
                        bio: res.doctor.bio || ''
                    });
                } else {
                    setError("Doctor not found.");
                }
            } catch (err) {
                setError(err.message || "Failed to load doctor details.");
            } finally {
                setLoading(false);
            }
        };

        fetchDoctor();
    }, [id]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                specialty: doctor.specialty,
                experience: Number(formData.experience),
                available: Boolean(formData.available),
                avatar: doctor.avatar,
                price: Number(formData.price),
                location: doctor.location,
                bio: formData.bio,
                schedule: doctor.schedule
            };
            const res = await updateDoctor(id, payload);
            if (res && res.success) {
                setIsEditing(false);
                // fetch updated data from server or just update local state
                const updatedRes = await getDoctorById(id);
                if (updatedRes && updatedRes.success) {
                    setDoctor(updatedRes.doctor);
                    setInitialForm({
                        price: updatedRes.doctor.price || 0,
                        experience: updatedRes.doctor.experience || 0,
                        available: !!updatedRes.doctor.available,
                        bio: updatedRes.doctor.bio || ''
                    });
                }
                toast.success("Doctor information updated successfully.");
            }
        } catch (err) {
            toast.error(err.message || "Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <><AdminNavbar /><div className="page"><div className="page-content"><ProfileSkeleton /></div></div></>;
    if (error) return <><AdminNavbar /><div className="page"><div className="page-content"><p className="admin-dashboard-error">{error}</p><button className="btn-secondary" onClick={() => navigate(-1)}>Go Back</button></div></div></>;
    if (!doctor) return null;

    return (
        <>
            <AdminNavbar />
            <div className="page" id="page-admin-doctor-details">
                <div className="page-content">
                    <div className="admin-doctor-details-header">
                        <div>
                            <h1 className="page-title">Doctor Details</h1>
                            <p className="page-subtitle">Detailed information and status</p>
                        </div>
                        <div className="admin-doctor-details-actions">
                            {isEditing ? (
                                <>
                                    <button 
                                        onClick={() => setIsEditing(false)} 
                                        disabled={isSaving}
                                        className="admin-doctor-details-btn-outline"
                                        onMouseEnter={(e) => { e.target.style.borderColor = 'var(--text-secondary)'; e.target.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.transform = 'none'; }}
                                    >
                                        Cancel
                                    </button>
                                    <SaveButton 
                                        onClick={handleSave} 
                                        isDirty={isDirty} 
                                        isSaving={isSaving} 
                                        text="Save Changes"
                                        className="admin-doctor-details-btn-primary"
                                    />
                                </>
                            ) : (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="admin-doctor-details-btn-primary"
                                    onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(15, 95, 95, 0.3)'; }}
                                    onMouseLeave={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none'; }}
                                >
                                    Edit Details
                                </button>
                            )}
                            <button 
                                onClick={() => navigate(-1)}
                                className="admin-doctor-details-btn-outline"
                                onMouseEnter={(e) => { e.target.style.borderColor = 'var(--text-secondary)'; e.target.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.transform = 'none'; }}
                            >
                                ← Back to Doctors
                            </button>
                        </div>
                    </div>

                    <div className="table-card admin-doctor-details-card">
                        <div className="admin-doctor-details-profile">
                            <div className="admin-doctor-details-avatar">{doctor.avatar || '👤'}</div>
                            <div>
                                <h2 className="admin-doctor-details-name">{doctor.name}</h2>
                                <p className="admin-doctor-details-email">{doctor.email}</p>
                                <div className="admin-doctor-details-status-wrap">
                                    <span className={`status-badge ${doctor.verification_status === 'approved' ? 'status-available' : doctor.verification_status === 'pending' ? 'status-busy' : 'status-rejected'}`}>
                                        Verification: {doctor.verification_status ? doctor.verification_status.toUpperCase() : 'UNKNOWN'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="admin-doctor-details-grid">
                            <div>
                                <label className="admin-doctor-details-label">Specialty</label>
                                <div className="admin-doctor-details-value">{doctor.specialty || 'Not specified'}</div>
                            </div>
                            <div>
                                <label className="admin-doctor-details-label">Experience</label>
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        name="experience"
                                        className="form-input" 
                                        value={formData.experience} 
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <div className="admin-doctor-details-value">{doctor.experience ? `${doctor.experience} Years` : 'Not specified'}</div>
                                )}
                            </div>
                            <div>
                                <label className="admin-doctor-details-label">Consultation Fee</label>
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        name="price"
                                        className="form-input" 
                                        value={formData.price} 
                                        onChange={handleChange}
                                    />
                                ) : (
                                    <div className="admin-doctor-details-value">${doctor.price || 0}</div>
                                )}
                            </div>
                            <div>
                                <label className="admin-doctor-details-label">License Number</label>
                                <div className="admin-doctor-details-value">{doctor.license_number || 'N/A'}</div>
                            </div>
                            <div>
                                <label className="admin-doctor-details-label">Current Availability</label>
                                {isEditing ? (
                                    <select 
                                        className="form-input" 
                                        name="available"
                                        value={formData.available ? 'true' : 'false'} 
                                        onChange={(e) => handleCustomChange('available', e.target.value === 'true')}
                                    >
                                        <option value="true">Available for Bookings</option>
                                        <option value="false">Not Available</option>
                                    </select>
                                ) : (
                                    <div className="admin-doctor-details-value">
                                        {doctor.available ? <span className="admin-doctor-details-available">Available for Bookings</span> : <span className="admin-doctor-details-unavailable">Not Available</span>}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="admin-doctor-details-label">Location</label>
                                <div className="admin-doctor-details-value">{doctor.location || 'Not specified'}</div>
                            </div>
                        </div>

                        <div className="admin-doctor-details-section">
                            <label className="admin-doctor-details-label">Professional Bio</label>
                            {isEditing ? (
                                <textarea 
                                    className="form-input" 
                                    name="bio"
                                    rows="4"
                                    value={formData.bio} 
                                    onChange={handleChange}
                                ></textarea>
                            ) : (
                                <div className="admin-doctor-details-bio-box">
                                    {doctor.bio || 'No biography provided.'}
                                </div>
                            )}
                        </div>

                        {doctor.created_at && (
                            <div className="admin-doctor-details-reg-wrap">
                                <h3 className="admin-doctor-details-reg-title">Registration Information</h3>
                                <div className="admin-doctor-details-grid">
                                    <div>
                                        <label className="admin-doctor-details-label">Account Created</label>
                                        <div className="admin-doctor-details-reg-value">{new Date(doctor.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                    </div>
                                    {doctor.verified_at && (
                                        <div>
                                            <label className="admin-doctor-details-label">Verification Date</label>
                                            <div className="admin-doctor-details-reg-value">{new Date(doctor.verified_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

        </>
    );
}

export default AdminDoctorDetails;
