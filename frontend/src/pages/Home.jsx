import Navigation from "../components/Navigation.jsx";
import Footer from "../components/Footer.jsx";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getRoleHomeRoute } from "../services/navigationUtils.js";
import GlobalLoader from "../components/loaders/GlobalLoader.jsx";

function Home(){

    const navigate = useNavigate();
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <GlobalLoader />;
    }

    if (isAuthenticated && user) {
        return <Navigate to={getRoleHomeRoute(user)} replace />;
    }

    const handleAction = (patientRoute, redirectRoute) => {
        if (!isAuthenticated) {
            navigate("/login", { state: { redirect: redirectRoute || patientRoute } });
        } else if (user?.role === "patient") {
            navigate(patientRoute);
        } else {
            navigate(`/${user?.role === "doctor" ? "doctor/dashboard" : "admin/dashboard"}`);
        }
    };

    const handleFindDoctor = () => handleAction("/patient/finddoctor", "/patient/finddoctor");
    const handleMakeAppointment = () => handleAction("/patient/appointment", "/patient/appointment");
    const handleGetTreatment = () => handleAction("/patient/home", "/patient/finddoctor");

    return (
        <>
            <Navigation/>

            <div className="page active" id="page-home">
                 {/*Hero Section*/}
                <section className="hero">
                    <div className="hero-content">
                        <div className="hero-badge"> Egypt's #1 Healthcare Platform</div>
                        <h1 className="hero-title">
                            <span className="white">Your Health,</span><br/>
                            <span className="gold">Our Priority</span>
                        </h1>
                        <p className="hero-description">
                            Book appointments with Egypt's top specialists. Smart scheduling, instant confirmation, and
                            seamless healthcare management.
                        </p>
                        <div className="hero-buttons">
                            {!isAuthenticated ? (
                                <>
                                    <Link to="/signuprole" className="btn btn-gold" >Get Started Free</Link>
                                    <Link to="/login" className="btn btn-white-outline">Sign In</Link>
                                </>
                            ) : (
                                <Link to={`/${user?.role === "patient" ? "patient/home" : user?.role === "doctor" ? "doctor/dashboard" : "admin/dashboard"}`} className="btn btn-gold">Go to Dashboard</Link>
                            )}
                        </div>
                    </div>
                    <div className="hero-stats">
                        <div className="stat-card-hero">
                            <div className="stat-number">500+</div>
                            <div className="stat-label">Expert Doctors</div>
                        </div>
                        <div className="stat-card-hero">
                            <div className="stat-number">50K+</div>
                            <div className="stat-label">Happy Patients</div>
                        </div>
                        <div className="stat-card-hero">
                            <div className="stat-number">98%</div>
                            <div className="stat-label">Satisfaction Rate</div>
                        </div>
                        <div className="stat-card-hero">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Support Available</div>
                        </div>
                    </div>
                </section>
                 {/*Medical Section*/}
                <section className="section">
                    <h2 className="section-title">Medical Specialties</h2>
                    <p className="section-subtitle">Find the right specialist for your needs</p>
                    <div className="specialties-grid">
                        <div className="specialty-tag">Cardiology</div>
                        <div className="specialty-tag">Neurology</div>
                        <div className="specialty-tag">Pediatrics</div>
                        <div className="specialty-tag">Orthopedics</div>
                        <div className="specialty-tag">Dermatology</div>
                        <div className="specialty-tag">Ophthalmology</div>
                        <div className="specialty-tag">Gynecology</div>
                        <div className="specialty-tag">Psychiatry</div>
                    </div>
                </section>
                {/* What Can You Do*/}
                <section className="section section-alt">
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-subtitle">Book your appointment in 3 simple steps</p>
                    <div className="steps-grid">
                        <div className="step-card" onClick={handleFindDoctor}>
                            <div className="step-number">01</div>
                            <div className="step-icon">🔍</div>
                            <h3 className="step-title">Find Your Doctor</h3>
                            <p className="step-desc">Browse our network of verified specialists filtered by specialty,
                                rating, and availability.</p>
                        </div>
                        <div className="step-card" onClick={handleMakeAppointment}>
                            <div className="step-number">02</div>
                            <div className="step-icon">📅</div>
                            <h3 className="step-title">Book Appointment</h3>
                            <p className="step-desc">Choose your preferred date and time slot. Get instant confirmation
                                via email.</p>
                        </div>
                        <div className="step-card" onClick={handleGetTreatment}>
                            <div className="step-number">03</div>
                            <div className="step-icon">✅</div>
                            <h3 className="step-title">Get Treatment</h3>
                            <p className="step-desc">Visit the doctor and receive the care you deserve. Track your
                                health history.</p>
                        </div>
                    </div>
                </section>
                 {/*Create Account*/}
                <section className="cta-section">
                    <h2 className="cta-title">Ready to Take Control of<br/>Your Health?</h2>
                    <p className="cta-desc">Join thousands of patients who trust MediCare Pro for their healthcare
                        needs.</p>
                    <Link to="/signuprole" className="cta-btn" >Create Free Account</Link>
                </section>
            </div>

            <Footer/>
        </>
    )
}

export default Home;