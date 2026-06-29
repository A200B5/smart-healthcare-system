import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PatientNavbar from "../../components/PatientNavbar.jsx";
import { toast } from "react-toastify";
import { createCheckoutSession } from "../../services/paymentService.js";
import "./patient.css";

function PatientCheckout() {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { doctor, appointmentData } = location.state || {};

    useEffect(() => {
        if (!doctor || !appointmentData) {
            toast.error("Invalid booking information");
            navigate("/patient/finddoctor");
        }
    }, [doctor, appointmentData, navigate]);

    if (!doctor || !appointmentData) return null;

    const handleProceedToPayment = async () => {
        try {
            setIsProcessing(true);
            
            // Phase 3: Prepare architecture by calling the service
            const paymentDetails = {
                doctorId: doctor.id,
                date: appointmentData.date,
                time: appointmentData.time,
                fee: doctor.price
            };

            const response = await createCheckoutSession(paymentDetails);

            if (response.success && response.url) {
                // Save state to sessionStorage before leaving the site
                sessionStorage.setItem("pendingPayment", JSON.stringify({
                    doctor: doctor,
                    appointmentData: appointmentData
                }));
                
                // Redirect to Stripe Checkout
                window.location.href = response.url;
            } else {
                toast.error("Failed to initiate payment");
                navigate("/patient/payment-failed");
            }
        } catch (error) {
            toast.error("An error occurred during checkout");
            navigate("/patient/payment-failed");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <PatientNavbar />

            <div className="page" id="page-checkout">
                <div className="page-content">
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">Appointment Summary</h1>
                            <p className="page-subtitle">Review your booking details before proceeding to payment.</p>
                        </div>

                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => navigate(-1)}
                        >
                            ← Back
                        </button>
                    </div>

                    <div className="checkout-layout">
                        <div className="checkout-summary-card">
                            <h2 className="table-title">Summary</h2>
                            
                            <div className="checkout-details">
                                <div className="summary-row">
                                    <span>Doctor Name</span>
                                    <strong>{doctor.name}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Doctor Specialty</span>
                                    <strong>{doctor.specialty}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Appointment Date</span>
                                    <strong>{appointmentData.date}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Appointment Time</span>
                                    <strong>{appointmentData.time}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Consultation Fee</span>
                                    <strong>${doctor.price}</strong>
                                </div>
                            </div>
                            
                            <div className="checkout-total">
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <strong>${doctor.price}</strong>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn-auth checkout-proceed-btn"
                                onClick={handleProceedToPayment}
                                disabled={isProcessing}
                            >
                                {isProcessing ? "Processing..." : "Proceed To Payment"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PatientCheckout;
