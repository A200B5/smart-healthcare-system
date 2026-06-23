import { Link } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { getRoleHomeRoute } from "../../services/navigationUtils.js";

export default function NotFound() {
    const { user } = useAuth();
    const homeRoute = getRoleHomeRoute(user);

    return (
        <section className="not-found-page">

            {/* Decorative Elements */}
            <div className="nf-plus nf-plus-1"></div>
            <div className="nf-plus nf-plus-2"></div>
            <div className="nf-plus nf-plus-3"></div>

            <div className="nf-dots nf-dots-top"></div>
            <div className="nf-dots nf-dots-bottom"></div>

            <div className="nf-circle nf-circle-1"></div>
            <div className="nf-circle nf-circle-2"></div>

            {/* Content */}
            <div className="not-found-content">

                <div className="nf-icon-wrapper">
                    <HeartPulse size={60} />
                </div>

                <h1 className="nf-error-code">
                    404
                </h1>

                <h2 className="nf-title">
                    Oops! Page Not Found
                </h2>

                <p className="nf-description">
                    The page you're looking for doesn't exist,
                    may have been moved, or the URL is incorrect.
                </p>

                <Link to={homeRoute} className="nf-home-btn">
                    Return Home
                </Link>

            </div>

        </section>
    );
}