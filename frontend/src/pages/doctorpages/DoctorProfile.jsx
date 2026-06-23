import { useEffect, useState } from "react";
import DoctorNavbar from "../../components/DoctorNavbar.jsx";
import { getCurrentUser } from "../../services/authService";
import { getDoctorProfile, updateDoctor } from "../../services/doctorService";

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
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
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
        setForm({
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

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;

    setForm({
      ...form,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    if (!doctorRecordId) {
      setSubmitError("Doctor profile record was not found for this account.");
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

      setSubmitSuccess("Profile updated successfully.");
    } catch (err) {
      setSubmitError(err.message);
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
            <p>Loading...</p>
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

          <div
            className="auth-card"
            style={{ maxWidth: "800px", margin: "0 auto" }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "24px",
                marginBottom: "32px",
              }}
            >
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "var(--primary-teal)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "48px",
                  color: "white",
                }}
              >
                👨‍⚕️
              </div>

              <div>
                <h2 style={{ fontSize: "24px", marginBottom: "4px" }}>
                  {doctor?.user?.name || "Doctor"}
                </h2>

                <p
                  style={{
                    color: "var(--primary-teal)",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  {doctor?.profile?.specialty || "Doctor"}
                </p>

                <p
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "14px",
                  }}
                >
                  📍 {doctor?.profile?.location || "Not set"}
                </p>
              </div>
            </div>

            {doctor?.profile?.verification_status === "pending" && (
              <div style={{ background: "#FEF3C7", color: "#92400E", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
                <strong>⏳ Pending Approval:</strong> Your profile is currently under review by an administrator. Some features may be restricted until approved.
              </div>
            )}

            {doctor?.profile?.verification_status === "rejected" && (
              <div style={{ background: "#FEE2E2", color: "#991B1B", padding: "16px", borderRadius: "8px", marginBottom: "24px" }}>
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

              <div className="checkbox-wrapper" style={{ marginBottom: "12px", background: "var(--bg-secondary)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    name="available"
                    id="profile-available"
                    type="checkbox"
                    checked={Boolean(form.available)}
                    onChange={handleChange}
                    style={{ width: "18px", height: "18px" }}
                  />
                  <label htmlFor="profile-available" style={{ fontWeight: 600 }}>Currently accepting appointments</label>
                </div>
              </div>

              {submitError && (
                <p style={{ color: "var(--rejected)", marginBottom: "8px" }}>
                  {submitError}
                </p>
              )}

              {submitSuccess && (
                <p style={{ color: "var(--confirmed)", marginBottom: "8px" }}>
                  {submitSuccess}
                </p>
              )}

              <button type="submit" className="btn-auth" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default DoctorProfile;