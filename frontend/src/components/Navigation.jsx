import {useTheme} from "../context/ThemeContext.jsx";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { HasRole } from "./permissions.jsx";

function Navigation() {
    const {theme , toggleTheme} = useTheme();
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <>
            <nav className="navbar" id="navbar-public">
                <Link to="/" className="navbar-logo" >
                    <img src="/logo.png" alt="MediCare Pro Logo" className="navbar-logo-img" /> MediCare Pro
                </Link>
                <div className="navbar-actions">
                    <button className="theme-toggle-nav" onClick={toggleTheme} id="themeToggle"
                            title="Toggle Light/Dark Mode">
                        {theme === "light" ? "🌙" : "☀️"}
                    </button>
                    {!isAuthenticated ? (
                        <>
                            <Link to="/login" className="btn btn-outline" >Login</Link>
                            <Link to="/signuprole" className="btn btn-primary" >Sign Up</Link>
                        </>
                    ) : (
                        <>
                            <HasRole allowedRoles={['patient']}>
                                <Link to="/patient/home" className="btn btn-primary">Go to Dashboard</Link>
                            </HasRole>
                            <HasRole allowedRoles={['doctor']}>
                                <Link to="/doctor/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                            </HasRole>
                            <HasRole allowedRoles={['admin']}>
                                <Link to="/admin/dashboard" className="btn btn-primary">Go to Dashboard</Link>
                            </HasRole>
                            <button onClick={() => { logout(); navigate("/login", { replace: true }); }} className="btn btn-outline">Logout</button>
                        </>
                    )}
                </div>
            </nav>
        </>
    )
}

export default Navigation;