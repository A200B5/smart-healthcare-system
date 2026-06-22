import Navigation from "../components/Navigation.jsx";
import { FcGoogle } from "react-icons/fc"
import { FaFacebook } from "react-icons/fa"
import {Link} from "react-router-dom";
function Login(){
    return(
        <>
            <Navigation/>
            <div className="page" id="page-login">
                <div className="auth-wrapper">
                    <div className="auth-card">
                        <div className="auth-icon">🏥</div>
                        <h1 className="auth-title">Welcome Back</h1>
                        <p className="auth-subtitle">Sign in to your MediCare Pro account</p>

                        <div className="error-msg" id="loginError">
                            ⚠️ <span>Invalid email or password. Please try again.</span>
                        </div>
                        <div className="success-msg" id="loginSuccess">
                            ✅ <span id="loginSuccessText">Welcome back!</span>
                        </div>

                        <form >
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input type="email" className="form-input" id="loginEmail" placeholder="you@example.com"
                                       autoComplete="off"    required/>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input type="password" className="form-input" id="loginPassword" placeholder="••••••••"
                                       autoComplete="new-password"    required/>
                            </div>
                            <button type="submit" className="btn-auth">Sign In</button>
                        </form>

                        <div className="divider">OR CONTINUE WITH</div>

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

                        <p className="auth-link">Don't have an account? <Link to="/signuprole">Sign up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login;