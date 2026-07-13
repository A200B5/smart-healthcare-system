import { useState, useEffect } from "react";
import PatientNavbar from "../../components/PatientNavbar.jsx";
import ProfileSkeleton from "../../components/loaders/ProfileSkeleton.jsx";
import { getCurrentUser, updateProfile } from "../../services/authService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "react-toastify";
import SaveButton from "../../components/SaveButton.jsx";
import { useFormState } from "../../services/formUtils.js";
import "./patient.css";

function PatientProfile() {
    const { login } = useAuth(); // If we need to update user context
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [initialForm, setInitialForm] = useState({
        name: "",
        email: "",
        phone: "",
        gender: "",
        dateOfBirth: "",
    });

    const { formData, handleChange, isDirty, syncSavedData } = useFormState(initialForm);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                setLoading(true);
                const data = await getCurrentUser();
                if (data && data.user) {
                    setInitialForm({
                        name: data.user.name || "",
                        email: data.user.email || "",
                        phone: data.user.phone ? data.user.phone.replace(/^\+20/, "") : "",
                        gender: data.user.gender || "",
                        dateOfBirth: data.user.dateOfBirth || "",
                    });
                }
            } catch (err) {
                toast.error("Failed to load profile information.");
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
    }, []);



    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!/^\d{10}$/.test(formData.phone)) {
            toast.error("Phone number must contain exactly 10 digits.");
            return;
        }

        setSaving(true);

        try {
            const data = await updateProfile({
                name: formData.name,
                phone: `+20${formData.phone}`,
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth,
            });

            if (data && data.success) {
                toast.success("Profile updated successfully.");
                syncSavedData();
                if (data.user) {
                    localStorage.setItem("user", JSON.stringify(data.user));
                }
            }
        } catch (err) {
            toast.error(err.message || "Failed to update profile.");
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

                    <div className="auth-card patient-profile-card">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group patient-form-group">
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

                            <div className="form-group patient-form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    className="form-input patient-input-disabled"
                                    value={formData.email}
                                    disabled
                                />
                                <small className="patient-form-hint">Email cannot be changed.</small>
                            </div>

                            <div className="form-group patient-form-group">
                                <label className="form-label">Phone Number</label>
                                <div className="phone-input-wrapper">
                                    <span className="phone-prefix">+20</span>
                                    <input
                                        type="tel"
                                        name="phone"
                                        className="form-input phone-input"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="1099841660"
                                    />
                                </div>
                            </div>

                            <div className="form-group patient-form-group">
                                <label className="form-label">Gender</label>
                                <select
                                    name="gender"
                                    className="form-input"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            <div className="form-group patient-form-group-lg">
                                <label className="form-label">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    className="form-input"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                />
                            </div>

                            <SaveButton
                                className="btn btn-primary patient-btn-full"
                                isDirty={isDirty}
                                isSaving={saving}
                                text="Save Profile"
                            />
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PatientProfile;