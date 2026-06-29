import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRoleHomeRoute } from "../services/navigationUtils.js";
import GlobalLoader from "./loaders/GlobalLoader.jsx";
import "./components.css";

const AlreadyAuthenticated = ({ children }) => {
    const { isAuthenticated, user, logout, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return <GlobalLoader />;
    }

    if (isAuthenticated && user) {
        const roleDisplay = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        const dashboardRoute = getRoleHomeRoute(user);

        return (
            <div className="page already-auth-page-wrapper">
                <div className="auth-card already-auth-card">
                    <div className="auth-icon already-auth-icon">👋</div>
                    <h2 className="already-auth-title">You are already signed in.</h2>
                    <p className="already-auth-text">
                        Current account: <strong>{roleDisplay}</strong>
                    </p>
                    
                    <div className="already-auth-actions">
                        <button 
                            className="already-auth-btn-primary"
                            onClick={() => navigate(dashboardRoute)}
                            onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-teal-dark)'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary-teal)'}
                        >
                            Go to Dashboard
                        </button>
                        
                        <button 
                            className="already-auth-btn-outline"
                            onClick={() => {
                                logout();
                                navigate("/login", { replace: true });
                            }}
                            onMouseOver={(e) => { e.target.style.borderColor = 'var(--text-secondary)'; e.target.style.backgroundColor = 'rgba(0,0,0,0.02)'; }}
                            onMouseOut={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.backgroundColor = 'transparent'; }}
                        >
                            Logout
                        </button>
                        
                        <button 
                            className="already-auth-btn-cancel"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return children;
};

export default AlreadyAuthenticated;
