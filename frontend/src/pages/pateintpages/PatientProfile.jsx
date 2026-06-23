import React, { useState, useEffect } from "react";
import PatientNavbar from "../../components/PatientNavbar.jsx";
import ProfileSkeleton from "../../components/loaders/ProfileSkeleton.jsx";
import { getCurrentUser, updateProfile } from "../../services/authService.js";
import { useAuth } from "../../context/AuthContext.jsx";

function PatientProfile() {
    const { login } = useAuth(); // If we need to update user context
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "",
        dateOfBirth: "",
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getCurrentUser();
                if (data && data.user) {
                    setFormData({
                        name: data.user.name || "",
                        email: data.user.email || "",
                        phone: data.user.phone || "",
                        gender: data.user.gender || "",
                        dateOfBirth: data.user.dateOfBirth || "",
                    });
                }
            } catch (err) {
                setError("Failed to load profile information.");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess("");

        try {
            const data = await updateProfile({
                name: formData.name,
                phone: formData.phone,
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth,
            });

            if (data && data.success) {
                setSuccess("Profile updated successfully!");
                // Also update local storage if necessary so AuthContext picks it up
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                    // We may need to force context reload or just let it be handled by next page load
                }
            }
        } catch (err) {
            setError(err.message || "Failed to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <PatientNavbar />
                <div className="page" id="page-patient-profile">
                    <div className="page-content">
                        <ProfileSkeleton />
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <PatientNavbar />
            <div className="page" id="page-patient-profile">
                <div className="page-content">
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">My Profile</h1>
                            <p className="page-subtitle">Manage your personal information</p>
                        </div>
                    </div>

                    <div className="auth-card" style={{ maxWidth: "600px", margin: "0 auto", padding: "32px", background: "var(--bg-secondary, #f8fafc)", borderRadius: "16px" }}>
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

                        {success && (
                            <div style={{
                                padding: "12px 16px",
                                marginBottom: "16px",
                                background: "rgba(34, 197, 94, 0.1)",
                                border: "1px solid rgba(34, 197, 94, 0.3)",
                                borderRadius: "8px",
                                color: "var(--confirmed, #22c55e)",
                                fontSize: "14px"
                            }}>
                                ✅ {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group" style={{ marginBottom: "16px" }}>
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: "16px" }}>
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input"
                                    value={formData.email}
                                    disabled
                                    style={{ background: "#e2e8f0", cursor: "not-allowed" }}
                                />
                                <small style={{ color: "var(--text-secondary)" }}>Email cannot be changed.</small>
                            </div>

                            <div className="form-group" style={{ marginBottom: "16px" }}>
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-input"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="e.g. +1234567890"
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: "16px" }}>
                                <label className="form-label">Gender</label>
                                <select
                                    name="gender"
                                    className="form-input"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: "24px" }}>
                                <label className="form-label">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    className="form-input"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                style={{ width: "100%" }}
                                disabled={saving}
                            >
                                {saving ? "Saving Changes..." : "Save Profile"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PatientProfile;
