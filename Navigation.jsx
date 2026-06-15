import {useTheme} from "../context/ThemeContext.jsx";


function Navigation() {
    const {theme , toggleTheme} = useTheme();
    return (
        <>
            <nav className="navbar" id="navbar-public">
                <div className="navbar-logo" to="/">
                    <span>🏥</span> MediCare Pro
                </div>
                <div className="navbar-actions">
                    <button className="theme-toggle-nav" onClick={toggleTheme} id="themeToggle"
                            title="Toggle Light/Dark Mode">
                        {theme === "light" ? "🌙" : "☀️"}
                    </button>
                    <button className="btn btn-outline">Login</button>
                    <button className="btn btn-primary">Sign Up</button>
                </div>
            </nav>
        </>
    )
}

export default Navigation;