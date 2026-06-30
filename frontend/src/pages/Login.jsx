import { useState } from "react";
import Navigation from "../components/Navigation.jsx";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const user = await login({ email, password });
            if (location.state?.sessionRefreshed) {
                toast.success("🔒 Your session has been refreshed successfully to keep your account secure.");
            } else {
                toast.success("Welcome back!");
            }

            // Redirect based on role
            const redirectPath = location.state?.redirect;
            if (redirectPath) {
                navigate(redirectPath);
            } else if (user.role === "admin") {
                navigate("/admin/dashboard");
            } else if (user.role === "doctor") {
                navigate("/doctor/dashboard");
            } else {
                navigate("/patient/home");
            }
        } catch (error) {
            const errorMsgStr = error.originalMessage || error.message || "";
            const isAccountStatusError =
                errorMsgStr.toLowerCase().includes("profile not found") ||
                errorMsgStr.toLowerCase().includes("pending") ||
                errorMsgStr.toLowerCase().includes("rejected");

            const toastOptions = isAccountStatusError ? {
                onClose: () => {
                    setEmail("");
                    setPassword("");
                }
            } : {};

            if (error.originalMessage === 'Your application was rejected.') {
                const reasonText = error.reason ? `"${error.reason}"` : "Please contact support for more information.";
                toast.error(`Your application was rejected.\n\nReason:\n${reasonText}`, toastOptions);
            } else {
                toast.error(error.message || "Invalid email or password. Please try again.", toastOptions);
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
                        <div className="auth-icon"><img src="/logo.png" alt="Logo" className="auth-logo-img" /></div>
                        <h1 className="auth-title">Welcome Back</h1>
                        <p className="auth-subtitle">Sign in to your MediCare Pro account</p>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="you@example.com"
                                    autoComplete="on"
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
                                    autoComplete="current-password"
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