import Navigation from "../../components/Navigation.jsx";

function SignupRole(){
    return(
        <>
            <Navigation/>
            <div className="page" id="page-signup-role">
                <div className="auth-wrapper">
                    <div className="auth-card">
                        <div className="auth-icon">👋</div>
                        <h1 className="auth-title">Join MediCare Pro</h1>
                        <p className="auth-subtitle">Choose your account type to get started</p>

                        <div className="role-grid">
                            <div className="role-card" >
                                <div className="role-icon">🧑</div>
                                <div className="role-info">
                                    <div className="role-name">Patient</div>
                                    <div className="role-desc">Book appointments and manage your health</div>
                                </div>
                                <div className="role-check"></div>
                            </div>
                            <div className="role-card">
                                <div className="role-icon">👨‍⚕️</div>
                                <div className="role-info">
                                    <div className="role-name">Doctor</div>
                                    <div className="role-desc">Manage your practice and patient appointments</div>
                                </div>
                                <div className="role-check"></div>
                            </div>
                            <div className="role-card">
                                <div className="role-icon">🔑</div>
                                <div className="role-info">
                                    <div className="role-name">Admin</div>
                                    <div className="role-desc">Manage the platform and oversee operations</div>
                                </div>
                                <div className="role-check"></div>
                            </div>
                        </div>
                        {/* "opacity: 0.5; pointer-events: none;"*/}
                        <button className="btn-auth btn-auth-role"  id="continueBtn">
                            Continue
                        </button>

                        <p className="auth-link">Already have an account? <a>Sign in</a></p>
                    </div>
                </div>
            </div>

        </>
    )
}

export default SignupRole;