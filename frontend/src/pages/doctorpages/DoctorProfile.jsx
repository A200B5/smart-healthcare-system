import { useState, useEffect } from "react";
import ProfileSkeleton from "../../components/loaders/ProfileSkeleton.jsx";
import DoctorNavbar from "../../components/DoctorNavbar.jsx";
import { getCurrentUser } from "../../services/authService";
import { getDoctorProfile, updateDoctor } from "../../services/doctorService";
import { toast } from "react-toastify";
import SaveButton from "../../components/SaveButton.jsx";
import { useFormState } from "../../services/formUtils.js";
import "./doctor.css";

const splitName = (fullName) => {
  const parts = (fullName || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

function DoctorProfile() {
  const [doctor, setDoctor] = useState(null);
  const [doctorRecordId, setDoctorRecordId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [initialForm, setInitialForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    specialty: "",
    experience: "",
    fee: "",
    location: "",
    bio: "",
    schedule: "",
    available: true,
    avatar: "👨‍⚕️",
  });
  
  const { formData: form, handleChange, isDirty, syncSavedData } = useFormState(initialForm);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);

        const [currentUserData, doctorProfileData] = await Promise.all([
          getCurrentUser(),
          getDoctorProfile(),
        ]);

        const user = currentUserData?.user || currentUserData;
        const matchedDoctor = doctorProfileData?.doctor || doctorProfileData;

        const { firstName, lastName } = splitName(user?.name);

        setDoctor({ user, profile: matchedDoctor || null });
        setDoctorRecordId(matchedDoctor?.id || matchedDoctor?._id || null);
        setInitialForm({
          firstName,
          lastName,
          email: user?.email || "",
          specialty: matchedDoctor?.specialty || "",
          experience: matchedDoctor?.experience ?? "",
          fee: matchedDoctor?.price ?? matchedDoctor?.fee ?? "",
          location: matchedDoctor?.location || "",
          bio: matchedDoctor?.bio || "",
          schedule: matchedDoctor?.schedule || "",
          available:
            typeof matchedDoctor?.available === "boolean"
              ? matchedDoctor.available
              : true,
          avatar: matchedDoctor?.avatar || "👨‍⚕️",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, []);



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!doctorRecordId) {
      toast.error("Doctor profile record was not found for this account.");
      return;
    }

    try {
      setSaving(true);

      await updateDoctor(doctorRecordId, {
        specialty: form.specialty,
        experience: form.experience === "" ? undefined : Number(form.experience),
        available: Boolean(form.available),
        avatar: form.avatar || "👨‍⚕️",
        price: form.fee === "" ? undefined : Number(form.fee),
        location: form.location,
        bio: form.bio,
        schedule: form.schedule,
      });

      toast.success("Profile updated successfully.");
      syncSavedData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <DoctorNavbar />
        <div className="page" id="page-doctor-profile">
          <div className="page-content">
            <ProfileSkeleton />
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <DoctorNavbar />
        <div className="page" id="page-doctor-profile">
          <div className="page-content">
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DoctorNavbar />

      <div className="page" id="page-doctor-profile">
        <div className="page-content">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">
            Manage your professional information
          </p>

          <div className="auth-card doctor-profile-card">
            {/* Header */}
            <div className="doctor-profile-header">
              <div className="doctor-profile-avatar">
                👨‍⚕️
              </div>

              <div>
                <h2 className="doctor-profile-name">
                  {doctor?.user?.name || "Doctor"}
                </h2>

                <p className="doctor-profile-specialty">
                  {doctor?.profile?.specialty || "Doctor"}
                </p>

                <p className="doctor-profile-location">
                  📍 {doctor?.profile?.location || "Not set"}
                </p>
              </div>
            </div>

            {doctor?.profile?.verification_status === "pending" && (
              <div className="doctor-dashboard-alert-pending">
                <strong>⏳ Pending Approval:</strong> Your profile is currently under review by an administrator. Some features may be restricted until approved.
              </div>
            )}

            {doctor?.profile?.verification_status === "rejected" && (
              <div className="doctor-dashboard-alert-rejected">
                <strong>❌ Application Rejected:</strong> {doctor?.profile?.rejection_reason || "Please update your profile information and contact support."}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    className="form-input"
                    value={form.firstName || ""}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    className="form-input"
                    value={form.lastName || ""}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  type="email"
                  className="form-input"
                  value={form.email || ""}
                  onChange={handleChange}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label">Specialty</label>
                <input
                  name="specialty"
                  type="text"
                  className="form-input"
                  value={form.specialty || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Years of Experience
                  </label>
                  <input
                    name="experience"
                    type="number"
                    className="form-input"
                    value={form.experience || ""}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Consultation Fee ($)
                  </label>
                  <input
                    name="fee"
                    type="number"
                    className="form-input"
                    value={form.fee || ""}
                    onChange={handleChange}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  name="location"
                  type="text"
                  className="form-input"
                  value={form.location || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  name="bio"
                  className="form-input"
                  value={form.bio || ""}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Schedule Notes</label>
                <textarea
                  name="schedule"
                  className="form-input"
                  value={form.schedule || ""}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="checkbox-wrapper doctor-profile-checkbox-wrap">
                <div className="doctor-profile-checkbox-inner">
                  <input
                    name="available"
                    id="profile-available"
                    type="checkbox"
                    checked={Boolean(form.available)}
                    onChange={handleChange}
                    className="doctor-profile-checkbox-input"
                  />
                  <label htmlFor="profile-available" className="doctor-profile-checkbox-label">Currently accepting appointments</label>
                </div>
              </div>

              <SaveButton
                className="btn-auth"
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

export default DoctorProfile;