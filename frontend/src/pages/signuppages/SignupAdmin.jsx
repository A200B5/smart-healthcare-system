import Navigation from "../../components/Navigation.jsx";

function SignupAdmin() {
    return(
        <>
            <Navigation/>
            <div className="page" id="page-signup-admin">
                <div className="auth-wrapper">
                    <div className="auth-card">
                        <a className="back-link">← Back to role selection</a>
                        <div style={{textAlign:"center"}}>
                            <div className="role-badge">🔑 Admin Account</div>
                        </div>
                        <h1 className="auth-title">Create Admin Account</h1>
                        <p className="auth-subtitle">Administrative access requires authorization</p>
                        <form>
                            <div className="form-group"><label className="form-label">Full Name</label><input
                                type="text" className="form-input" placeholder="Ahmed Bakr" required/></div>
                            <div className="form-group"><label className="form-label">Work Email</label><input
                                type="email" className="form-input" placeholder="admin@medicare.com" required/></div>
                            <div className="form-group"><label className="form-label">Phone Number</label><input
                                type="tel" className="form-input" placeholder="+20 100 000 0000" required/></div>
                            <div className="form-group"><label className="form-label">Department / Role</label><select
                                className="form-select" required>
                                <option value="">Select department...</option>
                                <option>Operations</option>
                                <option>IT & Technical Support</option>
                                <option>Finance</option>
                                <option>Customer Service</option>
                                <option>Management</option>
                            </select></div>
                            <div className="form-group"><label className="form-label">Employee ID</label><input
                                type="text" className="form-input" placeholder="EMP-00123" required/></div>
                            <div className="form-group"><label className="form-label">Authorization Code</label><input
                                type="text" className="form-input" placeholder="Provided by HR" required/></div>
                            <div className="form-group"><label className="form-label">Password</label><input
                                type="password" className="form-input" placeholder="At least 8 characters" required/>
                            </div>
                            <div className="form-group"><label className="form-label">Confirm Password</label><input
                                type="password" className="form-input" placeholder="Re-enter your password" required/>
                            </div>
                            <button type="submit" className="btn-auth">Request Admin Access</button>
                        </form>
                        <p className="auth-link">Already have an account? <a>Sign in</a></p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default SignupAdmin;