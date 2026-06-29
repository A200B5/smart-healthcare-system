import React from "react";
import { useNavigate } from "react-router-dom";
import PatientNavbar from "../../components/PatientNavbar.jsx";
import "./patient.css";

function PaymentFailed() {
    const navigate = useNavigate();

    const handleRetry = () => {
        const stored = sessionStorage.getItem("pendingPayment");
        if (stored) {
            const parsed = JSON.parse(stored);
            navigate("/patient/checkout", { state: parsed });
        } else {
            navigate("/patient/finddoctor");
        }
    };

    return (
        <>
            <PatientNavbar />

            <div className="page" id="page-payment-failed">
                <div className="page-content">
                    <div className="payment-result-container">
                        <div className="payment-icon failed-icon">
                            ✕
                        </div>
                        <h1 className="payment-title">Payment Failed</h1>
                        <p className="payment-subtitle">We're sorry, but your payment could not be completed at this time.</p>

                        <div className="payment-details-card">
                            <p className="payment-failed-message">
                                Please check your payment details and try again. 
                                If the problem persists, contact support or try a different payment method.
                            </p>
                        </div>

                        <div className="payment-actions">
                            <button
                                type="button"
                                className="btn-auth"
                                onClick={handleRetry}
                            >
                                Try Again
                            </button>
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={handleRetry}
                            >
                                Back to Checkout
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

export default PaymentFailed;
