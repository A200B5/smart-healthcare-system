import { useState } from "react";
import Navigation from "../../components/Navigation.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "react-toastify";
import "./signup.css";

function SignupPatient() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [gender, setGender] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();


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
            toast.error("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        const userData = {
            name: `${firstName} ${lastName}`.trim(),
            email,
            password,
            role: "patient",
            phone: "+20" + phone.trim(),
            gender,
            dateOfBirth
        };

        try {
            await register(userData);
            toast.success("Your account has been created successfully.");
            
            // Redirect to login after a short delay so user can see success message
            setTimeout(() => {
                navigate("/login");
            }, 2000);
            
        } catch (error) {
            toast.error(error.message || "Registration failed. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navigation />
            <div className="page" id="page-signup-patient">
                <div className="auth-wrapper">
                    <div className="auth-card">
                        <Link to="/signuprole" className="back-link">← Back to role selection</Link>
                        <div className="signup-role-badge-container">
                            <div className="role-badge">🧑 Patient Account</div>
                        </div>
                        <h1 className="auth-title">Create Patient Account</h1>
                        <p className="auth-subtitle">Fill in your details to get started</p>
                        

                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input 
                                        type="text" 
                                        className="form-input" 
                                        placeholder="John" 
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
                                        placeholder="Doe" 
                                        required
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input 
                                    type="email" 
                                    className="form-input" 
                                    placeholder="patient@email.com" 
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
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        className="form-input" 
                                        required
                                        value={dateOfBirth}
                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Gender</label>
                                    <select 
                                        className="form-select" 
                                        required
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                    >
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
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
                                {isSubmitting ? "Creating Account..." : "Create Patient Account"}
                            </button>
                        </form>
                        <p className="auth-link">Already have an account? <Link to="/login">Sign in</Link></p>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SignupPatient;