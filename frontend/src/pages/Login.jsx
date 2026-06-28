import { useState } from "react";
import Navigation from "../components/Navigation.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");
        setIsSubmitting(true);

        try {
            const user = await login({ email, password });
            setSuccessMsg("Welcome back!");

            // Redirect based on role
            if (user.role === "admin") {
                navigate("/admin/dashboard");
            } else if (user.role === "doctor") {
                navigate("/doctor/dashboard");
            } else {
                navigate("/patient/home");
            }
        } catch (error) {
            if (error.originalMessage === 'Your application was rejected.') {
                const reasonText = error.reason ? `"${error.reason}"` : "Please contact support for more information.";
                setErrorMsg(`Your application was rejected.\n\nReason:\n${reasonText}`);
            } else {
                setErrorMsg(error.message || "Invalid email or password. Please try again.");
            }
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navigation />
            <div className="page" id="page-login">
                <div className="auth-wrapper">
                    <div className="auth-card">
                        <div className="auth-icon">🏥</div>
                        <h1 className="auth-title">Welcome Back</h1>
                        <p className="auth-subtitle">Sign in to your MediCare Pro account</p>

                        {errorMsg && (
                            <div className="error-msg" style={{ display: 'block' }}>
                                ⚠️ <span style={{ whiteSpace: 'pre-line' }}>{errorMsg}</span>
                            </div>
                        )}

                        {successMsg && (
                            <div className="success-msg" style={{ display: 'block' }}>
                                ✅ <span>{successMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="you@example.com"
                                    autoComplete="off"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    autoComplete="new-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn-auth" disabled={isSubmitting}>
                                {isSubmitting ? "Signing in..." : "Sign In"}
                            </button>
                        </form>

                        <p className="auth-link">
                            Don't have an account? <Link to="/signuprole">Sign up</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;