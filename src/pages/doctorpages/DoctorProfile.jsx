import DoctorNavbar from "../../components/DoctorNavbar.jsx";

function DoctorProfile() {
    return (
        <>
           <DoctorNavbar />
            <div className="page" id="page-doctor-profile">
                <div className="page-content">
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Manage your professional information</p>

                    <div className="auth-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
                            <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "var(--primary-teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", color: "white" }}>👨‍⚕️</div>
                            <div>
                                <h2 style={{ fontSize: "24px", marginBottom: "4px" }}>Dr. Ahmed Bakr</h2>
                                <p style={{ color: "var(--primary-teal)", fontWeight: 600, marginBottom: "4px" }}>Cardiology Specialist</p>
                                <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>📍 Cairo Medical Center</p>
                            </div>
                        </div>

                        <form>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">First Name</label><input type="text" className="form-input" value="Ahmed" /></div>
                                <div className="form-group"><label className="form-label">Last Name</label><input type="text" className="form-input" value="Bakr" /></div>
                            </div>
                            <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" value="ahmedbakr8818@gmail.com" /></div>
                            <div className="form-group"><label className="form-label">Specialty</label><input type="text" className="form-input" value="Cardiology" /></div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Years of Experience</label><input type="number" className="form-input" value="15" /></div>
                                <div className="form-group"><label className="form-label">Consultation Fee ($)</label><input type="number" className="form-input" value="150" /></div>
                            </div>
                            <button type="submit" className="btn-auth">Save Changes</button>
                        </form>
                    </div>
                </div>
            </div>


        </>
    )
}

export default DoctorProfile;