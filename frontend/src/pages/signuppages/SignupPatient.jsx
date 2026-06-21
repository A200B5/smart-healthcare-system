
import {FcGoogle} from "react-icons/fc";
import {FaFacebook} from "react-icons/fa";
import Navigation from "../../components/Navigation.jsx";

function SignupPatient(){
    return (
        <>
            <Navigation />
            <div className="page" id="page-signup-patient">
                <div className="auth-wrapper">
                    <div className="auth-card">
                        <a className="back-link">← Back to role selection</a>
                        <div style={{ textAlign: "center" }}>
                            <div className="role-badge">🧑 Patient Account</div>
                        </div>
                        <h1 className="auth-title">Create Patient Account</h1>
                        <p className="auth-subtitle">Fill in your details to get started</p>
                        <form>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">First Name</label><input
                                    type="text" className="form-input" placeholder="John" required/></div>
                                <div className="form-group"><label className="form-label">Last Name</label><input
                                    type="text" className="form-input" placeholder="Doe" required/></div>
                            </div>
                            <div className="form-group"><label className="form-label">Email Address</label><input
                                type="email" className="form-input" placeholder="patient@email.com" required/></div>
                            <div className="form-group"><label className="form-label">Phone Number</label><input
                                type="tel" className="form-input" placeholder="+20 100 000 0000" required/></div>
                            <div className="form-row">
                                <div className="form-group"><label className="form-label">Date of Birth</label><input
                                    type="date" className="form-input" required/></div>
                                <div className="form-group"><label className="form-label">Gender</label><select
                                    className="form-select" required>
                                    <option value="">Select...</option>
                                    <option>Male</option>
                                    <option>Female</option>
                                </select></div>
                            </div>
                            <div className="form-group"><label className="form-label">Password</label><input
                                type="password" className="form-input" placeholder="At least 8 characters" required/>
                            </div>
                            <div className="form-group"><label className="form-label">Confirm Password</label><input
                                type="password" className="form-input" placeholder="Re-enter your password" required/>
                            </div>
                            <button type="submit" className="btn-auth">Create Patient Account</button>
                        </form>
                        <div className="divider">OR SIGN UP WITH</div>
                        <div className="social-buttons">
                            <button className="btn-social btn-google">
                                Continue with Google
                                <FcGoogle size={22} />
                            </button>
                            <button className="btn-social btn-facebook">
                                Continue with Facebook
                                <FaFacebook size={22} color="#1877F2" />
                            </button>
                        </div>
                        <p className="auth-link">Already have an account? <a>Sign in</a></p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SignupPatient;