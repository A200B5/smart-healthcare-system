import { useState } from "react";
import Navigation from "../../components/Navigation.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "react-toastify";
import "./signup.css";

function SignupDoctor() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [licenseNumber, setLicenseNumber] = useState("");
    const [experience, setExperience] = useState("");
    const [location, setLocation] = useState("");
    const [price, setPrice] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");
        setSuccessMsg("");

        if (!phone || phone.trim() === "") {
            toast.error("Phone number is required.");
            return;
        }

        const egyptianPhoneRegex = /^1[0125][0-9]{8}$/;
        if (!egyptianPhoneRegex.test(phone.trim())) {
            toast.error("Please enter a valid Egyptian mobile number.");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        const userData = {
            name: `${firstName} ${lastName}`.trim(),
            email,
            password,
            role: "doctor",
            phone: "+20" + phone.trim(),
            specialty,
            experience: parseInt(experience, 10),
            location,
            price: parseFloat(price),
            licenseNumber
        };

        try {
            await register(userData);
            setSuccessMsg("Your account has been created successfully and is awaiting admin approval.");
            
            // Redirect to login after a short delay
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 3000);
            
        } catch (error) {
            setErrorMsg(error.message || "Registration failed. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navigation/>
            <div className="page" id="page-signup-doctor">
                <div className="auth-wrapper">
                    <div className="auth-card">
                        <Link to="/signuprole" className="back-link">← Back to role selection</Link>
                        <div className="signup-role-badge-container">
                            <div className="role-badge">👨‍⚕️ Doctor Account</div>
                        </div>
                        <h1 className="auth-title">Create Doctor Account</h1>
                        <p className="auth-subtitle">Join our network of verified specialists</p>
                        
                        {errorMsg && (
                            <div className="error-msg signup-msg-visible">
                                ⚠️ <span>{errorMsg}</span>
                            </div>
                        )}
                        
                        {successMsg && (
                            <div className="success-msg signup-msg-visible">
                                ✅ <span>{successMsg}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input
                                        type="text" 
                                        className="form-input" 
                                        placeholder="Sarah" 
                                        required
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input
                                        type="text" 
                                        className="form-input" 
                                        placeholder="Johnson" 
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Professional Email</label>
                                <input
                                    type="email" 
                                    className="form-input" 
                                    placeholder="doctor@clinic.com" 
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <div className="phone-input-wrapper">
                                    <span className="phone-prefix">+20</span>
                                    <input
                                        type="tel" 
                                        className="phone-input-field" 
                                        placeholder="100 000 0000" 
                                        required
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Medical Specialty</label>
                                <select
                                    className="form-select" 
                                    required
                                    value={specialty}
                                    onChange={(e) => setSpecialty(e.target.value)}
                                >
                                    <option value="">Select your specialty...</option>
                                    <option value="Cardiology">Cardiology</option>
                                    <option value="Neurology">Neurology</option>
                                    <option value="Pediatrics">Pediatrics</option>
                                    <option value="Orthopedics">Orthopedics</option>
                                    <option value="Dermatology">Dermatology</option>
                                    <option value="Ophthalmology">Ophthalmology</option>
                                    <option value="Gynecology">Gynecology</option>
                                    <option value="Psychiatry">Psychiatry</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">License Number</label>
                                    <input
                                        type="text" 
                                        className="form-input" 
                                        placeholder="MED-12345" 
                                        required
                                        value={licenseNumber}
                                        onChange={(e) => setLicenseNumber(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Years of Experience</label>
                                    <input 
                                        type="number" 
                                        className="form-input" 
                                        placeholder="10"
                                        min="0" 
                                        required
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Clinic / Hospital</label>
                                <input
                                    type="text" 
                                    className="form-input" 
                                    placeholder="Cairo Medical Center" 
                                    required
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Consultation Fee (USD)</label>
                                <input 
                                    type="number" 
                                    className="form-input" 
                                    placeholder="150" 
                                    min="0"
                                    required
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <input
                                    type="password" 
                                    className="form-input" 
                                    placeholder="At least 8 characters" 
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm Password</label>
                                <input
                                    type="password" 
                                    className="form-input" 
                                    placeholder="Re-enter your password" 
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <button type="submit" className="btn-auth" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Submit for Verification"}
                            </button>
                        </form>
                        <p className="auth-link">Already have an account? <Link to="/login" >Sign in</Link></p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SignupDoctor;