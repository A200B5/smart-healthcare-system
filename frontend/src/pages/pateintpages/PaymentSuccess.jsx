import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PatientNavbar from "../../components/PatientNavbar.jsx";
import { toast } from "react-toastify";
import { verifyPayment } from "../../services/paymentService.js";
import "./patient.css";

function PaymentSuccess() {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Parse session_id from URL query params
    const queryParams = new URLSearchParams(location.search);
    const sessionId = queryParams.get("session_id");

    const [paymentDetails, setPaymentDetails] = React.useState(null);
    const [bookingStatus, setBookingStatus] = React.useState("loading");
    const bookingAttempted = React.useRef(false);

    useEffect(() => {
        if (!sessionId) {
            toast.error("No payment session found.");
            navigate("/patient/payment-failed");
            return;
        }

        if (!bookingAttempted.current) {
            bookingAttempted.current = true;
            
            const processPayment = async () => {
                try {
                    // Verify Payment and Create Appointment (Backend handles both)
                    const verifyRes = await verifyPayment(sessionId);
                    
                    if (!verifyRes.success || !verifyRes.payment) {
                        toast.error("Payment verification failed.");
                        navigate("/patient/payment-failed");
                        return;
                    }

                    // Success
                    setPaymentDetails(verifyRes.payment);
                    setBookingStatus("success");
                    sessionStorage.removeItem("pendingPayment"); // Clean up if any
                } catch (error) {
                    setBookingStatus("error");
                    toast.error("An error occurred during payment verification.");
                    navigate("/patient/payment-failed");
                }
            };
            
            processPayment();
        }
    }, [sessionId, navigate]);

    if (!sessionId) return null;

    return (
        <>
            <PatientNavbar />

            <div className="page" id="page-payment-success">
                <div className="page-content">
                    <div className="payment-result-container">
                        <div className="payment-icon success-icon">
                            ✓
                        </div>
                        <h1 className="payment-title">
                            {bookingStatus === "loading" ? "Confirming Appointment..." : 
                             bookingStatus === "success" ? "Payment Successful" : 
                             "Payment Successful, But..."}
                        </h1>
                        <p className="payment-subtitle">
                            {bookingStatus === "loading" ? "Your payment is complete. We are now confirming your appointment..." : 
                             "Your payment has been completed successfully. Your appointment is confirmed."}
                        </p>

                        <div className="payment-details-card">
                            <div className="summary-row">
                                <span>Transaction ID</span>
                                <strong>{paymentDetails?.transactionId || 'Loading...'}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Doctor</span>
                                <strong>{paymentDetails?.doctorName || 'Unknown'} ({paymentDetails?.doctorSpecialty || 'N/A'})</strong>
                            </div>
                            <div className="summary-row">
                                <span>Appointment Date</span>
                                <strong>{paymentDetails?.date || 'N/A'}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Appointment Time</span>
                                <strong>{paymentDetails?.time || 'N/A'}</strong>
                            </div>
                            <div className="summary-row total">
                                <span>Amount Paid</span>
                                <strong>${paymentDetails?.amount || '0'} {paymentDetails?.currency?.toUpperCase() || ''}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Payment Status</span>
                                <strong style={{ color: "var(--success)" }}>
                                    {paymentDetails?.paymentStatus?.toUpperCase() || 'PAID'}
                                </strong>
                            </div>
                            <div className="summary-row">
                                <span>Payment Method</span>
                                <strong>{paymentDetails?.paymentMethod?.toUpperCase() || 'CARD'}</strong>
                            </div>
                        </div>

                        <div className="payment-actions">
                            <button
                                type="button"
                                className="btn-auth"
                                onClick={() => navigate("/patient/appointment")}
                                disabled={bookingStatus === "loading"}
                            >
                                My Appointments
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => navigate("/patient/home")}
                            >
                                Back Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PaymentSuccess;
