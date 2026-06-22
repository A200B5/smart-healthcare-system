import Navigation from "../../components/Navigation.jsx";
import {Link} from "react-router-dom";
function SignupDoctor(){
    return (
        <>
            <Navigation/>
            <div className="page" id="page-signup-doctor">
                <div className="auth-wrapper">
                    <div className="auth-card">
                        <Link to="/signuprole" className="back-link">← Back to role selection</Link>
                        <div style={{textAlign:"center"}}>
                            <div className="role-badge">👨‍⚕️ Doctor Account</div>
                        </div>
                        <h1 className="auth-title">Create Doctor Account</h1>
                        <p className="auth-subtitle">Join our network of verified specialists</p>
                        <form>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">First Name</label><input
                                    type="text" className="form-input" placeholder="Sarah" required/></div>
                                <div className="form-group"><label className="form-label">Last Name</label><input
                                    type="text" className="form-input" placeholder="Johnson" required/></div>
                            </div>
                            <div className="form-group"><label className="form-label">Professional Email</label><input
                                type="email" className="form-input" placeholder="doctor@clinic.com" required/></div>
                            <div className="form-group"><label className="form-label">Phone Number</label><input
                                type="tel" className="form-input" placeholder="+20 100 000 0000" required/></div>
                            <div className="form-group"><label className="form-label">Medical Specialty</label><select
                                className="form-select" required>
                                <option value="">Select your specialty...</option>
                                <option>Cardiology</option>
                                <option>Neurology</option>
                                <option>Pediatrics</option>
                                <option>Orthopedics</option>
                                <option>Dermatology</option>
                                <option>Ophthalmology</option>
                                <option>Gynecology</option>
                                <option>Psychiatry</option>
                            </select></div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">License Number</label><input
                                    type="text" className="form-input" placeholder="MED-12345" required/></div>
                                <div className="form-group"><label className="form-label">Years of
                                    Experience</label><input type="number" className="form-input" placeholder="10"
                                                             min="0" required/></div>
                            </div>
                            <div className="form-group"><label className="form-label">Clinic / Hospital</label><input
                                type="text" className="form-input" placeholder="Cairo Medical Center" required/></div>
                            <div className="form-group"><label className="form-label">Consultation Fee
                                (USD)</label><input type="number" className="form-input" placeholder="150" min="0"
                                                    required/></div>
                            <div className="form-group"><label className="form-label">Password</label><input
                                type="password" className="form-input" placeholder="At least 8 characters" required/>
                            </div>
                            <div className="form-group"><label className="form-label">Confirm Password</label><input
                                type="password" className="form-input" placeholder="Re-enter your password" required/>
                            </div>
                            <button type="submit" className="btn-auth">Submit for Verification</button>
                        </form>
                        <p className="auth-link">Already have an account? <Link to="/login" >Sign in</Link></p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SignupDoctor;