import React, { useState, useEffect } from "react";
import ProfileSkeleton from "../../components/loaders/ProfileSkeleton.jsx";
import { useParams, useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavbar.jsx";
import { getDoctorById, updateDoctor } from "../../services/adminService.js";
import AlertModal from "../../components/AlertModal.jsx";

function AdminDoctorDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [doctor, setDoctor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        price: 0,
        experience: 0,
        available: false,
        bio: ''
    });
    const [alertInfo, setAlertInfo] = useState({ isOpen: false, message: "" });

    useEffect(() => {
        const fetchDoctor = async () => {
            try {
                const res = await getDoctorById(id);
                if (res && res.success) {
                    setDoctor(res.doctor);
                    setFormData({
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
                if (updatedRes && updatedRes.success) setDoctor(updatedRes.doctor);
            }
        } catch (err) {
            setAlertInfo({ isOpen: true, message: err.message || "Failed to save changes." });
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <><AdminNavbar /><div className="page"><div className="page-content"><ProfileSkeleton /></div></div></>;
    if (error) return <><AdminNavbar /><div className="page"><div className="page-content"><p style={{ color: "red" }}>{error}</p><button className="btn-secondary" onClick={() => navigate(-1)}>Go Back</button></div></div></>;
    if (!doctor) return null;

    return (
        <>
            <AdminNavbar />
            <div className="page" id="page-admin-doctor-details">
                <div className="page-content">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h1 className="page-title">Doctor Details</h1>
                            <p className="page-subtitle">Detailed information and status</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {isEditing ? (
                                <>
                                    <button 
                                        onClick={() => setIsEditing(false)} 
                                        disabled={isSaving}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                            background: 'transparent', color: 'var(--text-primary)',
                                            border: '2px solid var(--border-color)', borderRadius: '999px',
                                            padding: '0 24px', fontSize: '15px', fontWeight: '600',
                                            transition: 'all 0.2s ease', cursor: 'pointer', height: '44px'
                                        }}
                                        onMouseEnter={(e) => { e.target.style.borderColor = 'var(--text-secondary)'; e.target.style.transform = 'translateY(-2px)'; }}
                                        onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.transform = 'none'; }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSave} 
                                        disabled={isSaving} 
                                        style={{ 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            background: 'var(--primary-teal)', color: 'white',
                                            border: 'none', borderRadius: '999px',
                                            padding: '0 24px', fontSize: '15px', fontWeight: '600',
                                            transition: 'all 0.2s ease', cursor: 'pointer', height: '44px'
                                        }}
                                        onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(15, 95, 95, 0.3)'; }}
                                        onMouseLeave={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none'; }}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    style={{ 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'var(--primary-teal)', color: 'white',
                                        border: 'none', borderRadius: '999px',
                                        padding: '0 24px', fontSize: '15px', fontWeight: '600',
                                        transition: 'all 0.2s ease', cursor: 'pointer', height: '44px'
                                    }}
                                    onMouseEnter={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(15, 95, 95, 0.3)'; }}
                                    onMouseLeave={(e) => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none'; }}
                                >
                                    Edit Details
                                </button>
                            )}
                            <button 
                                onClick={() => navigate(-1)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                    background: 'transparent', color: 'var(--text-primary)',
                                    border: '2px solid var(--border-color)', borderRadius: '999px',
                                    padding: '0 24px', fontSize: '15px', fontWeight: '600',
                                    transition: 'all 0.2s ease', cursor: 'pointer', height: '44px'
                                }}
                                onMouseEnter={(e) => { e.target.style.borderColor = 'var(--text-secondary)'; e.target.style.transform = 'translateY(-2px)'; }}
                                onMouseLeave={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.transform = 'none'; }}
                            >
                                ← Back to Doctors
                            </button>
                        </div>
                    </div>

                    <div className="table-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '4rem' }}>{doctor.avatar || '👤'}</div>
                            <div>
                                <h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{doctor.name}</h2>
                                <p style={{ margin: '0', color: 'var(--text-secondary)' }}>{doctor.email}</p>
                                <div style={{ marginTop: '0.5rem' }}>
                                    <span className={`status-badge ${doctor.verification_status === 'approved' ? 'status-available' : doctor.verification_status === 'pending' ? 'status-busy' : 'status-rejected'}`}>
                                        Verification: {doctor.verification_status ? doctor.verification_status.toUpperCase() : 'UNKNOWN'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Specialty</label>
                                <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{doctor.specialty || 'Not specified'}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Experience</label>
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        className="form-input" 
                                        value={formData.experience} 
                                        onChange={(e) => setFormData({...formData, experience: e.target.value})}
                                    />
                                ) : (
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{doctor.experience ? `${doctor.experience} Years` : 'Not specified'}</div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Consultation Fee</label>
                                {isEditing ? (
                                    <input 
                                        type="number" 
                                        className="form-input" 
                                        value={formData.price} 
                                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                                    />
                                ) : (
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>${doctor.price || 0}</div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>License Number</label>
                                <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{doctor.license_number || 'N/A'}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Current Availability</label>
                                {isEditing ? (
                                    <select 
                                        className="form-input" 
                                        value={formData.available ? 'true' : 'false'} 
                                        onChange={(e) => setFormData({...formData, available: e.target.value === 'true'})}
                                    >
                                        <option value="true">Available for Bookings</option>
                                        <option value="false">Not Available</option>
                                    </select>
                                ) : (
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>
                                        {doctor.available ? <span style={{ color: 'var(--primary-teal)' }}>Available for Bookings</span> : <span style={{ color: 'var(--text-secondary)' }}>Not Available</span>}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Location</label>
                                <div style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>{doctor.location || 'Not specified'}</div>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Professional Bio</label>
                            {isEditing ? (
                                <textarea 
                                    className="form-input" 
                                    rows="4"
                                    value={formData.bio} 
                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                ></textarea>
                            ) : (
                                <div style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '4px', minHeight: '80px' }}>
                                    {doctor.bio || 'No biography provided.'}
                                </div>
                            )}
                        </div>

                        {doctor.createdAt && (
                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Registration Information</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                    <div>
                                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Account Created</label>
                                        <div style={{ color: 'var(--text-primary)' }}>{new Date(doctor.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                    </div>
                                    {doctor.verified_at && (
                                        <div>
                                            <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Verification Date</label>
                                            <div style={{ color: 'var(--text-primary)' }}>{new Date(doctor.verified_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <AlertModal
                isOpen={alertInfo.isOpen}
                title="Notice"
                message={alertInfo.message}
                onClose={() => setAlertInfo({ isOpen: false, message: "" })}
            />
        </>
    );
}

export default AdminDoctorDetails;
