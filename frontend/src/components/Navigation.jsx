import {useTheme} from "../context/ThemeContext.jsx";
import {useNavigate} from "react-router-dom";
import {Link} from "react-router-dom";

function Navigation() {
    const {theme , toggleTheme} = useTheme();

    return (
        <>
            <nav className="navbar" id="navbar-public">
                <Link to="/" className="navbar-logo" >
                    <span>🏥</span> MediCare Pro
                </Link>
                <div className="navbar-actions">
                    <button className="theme-toggle-nav" onClick={toggleTheme} id="themeToggle"
                            title="Toggle Light/Dark Mode">
                        {theme === "light" ? "🌙" : "☀️"}
                    </button>
                    <Link to="/login" className="btn btn-outline" >Login</Link>
                    <Link to="/signuprole" className="btn btn-primary" >Sign Up</Link>
                </div>
            </nav>
        </>
    )
}

export default Navigation;