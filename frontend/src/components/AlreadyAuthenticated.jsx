import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRoleHomeRoute } from "../utils/navigationUtils.js";

const AlreadyAuthenticated = ({ children }) => {
    const { isAuthenticated, user, logout, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Loading...</p>
            </div>
        );
    }

    if (isAuthenticated && user) {
        const roleDisplay = user.role.charAt(0).toUpperCase() + user.role.slice(1);
        const dashboardRoute = getRoleHomeRoute(user);

        return (
            <div className="page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
                <div className="auth-card" style={{ textAlign: 'center', padding: '2.5rem', maxWidth: '400px', width: '100%', backgroundColor: 'var(--bg-primary)', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <div className="auth-icon" style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.5rem' }}>You are already signed in.</h2>
                    <p style={{ marginBottom: '2rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>
                        Current account: <strong>{roleDisplay}</strong>
                    </p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button 
                            onClick={() => navigate(dashboardRoute)}
                            style={{ 
                                width: '100%', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer',
                                backgroundColor: 'var(--primary-teal)', color: 'white', border: 'none',
                                fontSize: '1rem', fontWeight: '500', transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-teal-dark)'}
                            onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary-teal)'}
                        >
                            Go to Dashboard
                        </button>
                        
                        <button 
                            onClick={() => {
                                logout();
                                navigate("/login", { replace: true });
                            }}
                            style={{ 
                                width: '100%', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', 
                                backgroundColor: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)',
                                fontSize: '1rem', fontWeight: '500', transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => { e.target.style.borderColor = 'var(--text-secondary)'; e.target.style.backgroundColor = 'rgba(0,0,0,0.02)'; }}
                            onMouseOut={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.backgroundColor = 'transparent'; }}
                        >
                            Logout
                        </button>
                        
                        <button 
                            onClick={() => navigate(-1)}
                            style={{ 
                                width: '100%', padding: '0.75rem', borderRadius: '8px', cursor: 'pointer', 
                                background: 'none', border: 'none', color: 'var(--text-secondary)',
                                fontSize: '0.9rem', fontWeight: '500', textDecoration: 'underline'
                            }}
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
