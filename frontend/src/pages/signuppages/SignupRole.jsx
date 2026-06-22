import Navigation from "../../components/Navigation.jsx";
import {useState} from "react";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router-dom";

function SignupRole(){
    const [selectedRole , setSelectedRole] = useState("");
    const navigate = useNavigate();
    const handleContinue = () => {
        console.log(selectedRole);
        if (!selectedRole){
            return;
        }
        navigate(`/signup/${selectedRole}`);
    }
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
                            <div className={`role-card ${selectedRole === "patient" ? "selected" : ""}`}
                                 onClick={ () => setSelectedRole("patient") }  >
                                <div className="role-icon">🧑</div>
                                <div className="role-info">
                                    <div className="role-name">Patient</div>
                                    <div className="role-desc">Book appointments and manage your health</div>
                                </div>
                                <div className="role-check"></div>
                            </div>
                            <div className={`role-card ${selectedRole === "doctor" ? "selected" : ""}`}
                                 onClick={ () => setSelectedRole("doctor") }        >
                                <div className="role-icon">👨‍⚕️</div>
                                <div className="role-info">
                                    <div className="role-name">Doctor</div>
                                    <div className="role-desc">Manage your practice and patient appointments</div>
                                </div>
                                <div className="role-check"></div>
                            </div>
                            <div className={`role-card ${selectedRole === "admin" ? "selected" : ""}`}
                                 onClick={ () => setSelectedRole("admin") }         >
                                <div className="role-icon">🔑</div>
                                <div className="role-info">
                                    <div className="role-name">Admin</div>
                                    <div className="role-desc">Manage the platform and oversee operations</div>
                                </div>
                                <div className="role-check"></div>
                            </div>
                        </div>
                        {/* "opacity: 0.5; pointer-events: none;"*/}
                        <button className={`btn-auth ${!selectedRole ? "btn-auth-role" : ""}`}  id="continueBtn"
                          onClick={handleContinue}
                          disabled={!selectedRole}    >
                            Continue
                        </button>

                        <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
                    </div>
                </div>
            </div>

        </>
    )
}

export default SignupRole;