import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CardSkeleton from "../../components/loaders/CardSkeleton.jsx";
import PatientNavbar from "../../components/PatientNavbar.jsx";
import { getPaymentHistory } from "../../services/paymentService.js";
import "./patient.css";

function PatientPayments() {
    const navigate = useNavigate();

    // ── State ────────────────────────────────
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [selectedPayment, setSelectedPayment] = useState(null);

    // ── Load Payments ─────────────────────────────────
    const loadPayments = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getPaymentHistory();
            const list = data?.payments || [];
            setPayments(list);
        } catch (err) {
            setError(err.message || "Failed to load payment history");
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, []);

    // ── Filtering & Searching ─────────────────────────────────────────
    const filteredPayments = payments.filter((p) => {
        // Filter by status
        if (filter !== "all" && p.paymentStatus !== filter) return false;

        // Search by Doctor Name or Transaction ID
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            const doctorMatch = (p.doctorName || "").toLowerCase().includes(query);
            const txnMatch = (p.transactionId || "").toLowerCase().includes(query);
            if (!doctorMatch && !txnMatch) return false;
        }

        return true;
    });

    const statusCounts = {
        all: payments.length,
        paid: payments.filter((p) => p.paymentStatus === "paid").length,
        pending: payments.filter((p) => p.paymentStatus === "pending").length,
        failed: payments.filter((p) => p.paymentStatus === "failed").length,
    };

    // ── Format Date ───────────────────────────────────────
    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === "-") return "-";
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        } catch {
            return dateStr;
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";
        try {
            const d = new Date(dateStr);
            return d.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        } catch {
            return dateStr;
        }
    };

    return (
        <>
            <PatientNavbar />
            <div className="page" id="page-patient-payments">
                <div className="page-content">
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">My Payments</h1>
                            <p className="page-subtitle">View your payment history and receipts</p>
                        </div>
                    </div>

                    {/* Filter and Search Controls */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "20px" }}>
                        <div className="search-bar" style={{ maxWidth: "400px" }}>
                            <input
                                type="text"
                                placeholder="Search by Doctor or Transaction ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="form-input"
                                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)" }}
                            />
                        </div>

                        <div className="filter-tabs">
                            {["all", "paid", "pending", "failed"].map((status) => (
                                <button
                                    key={status}
                                    className={`filter-tab ${filter === status ? "active" : ""}`}
                                    onClick={() => setFilter(status)}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)} ({statusCounts[status] || 0})
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="patient-home-error">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="patient-appt-list">
                            <CardSkeleton />
                            <CardSkeleton />
                            <CardSkeleton />
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="original-empty-state">
                            <p>No payments found.</p>
                            <button
                                className="btn btn-primary patient-appt-mt"
                                onClick={() => navigate("/patient/finddoctor")}
                            >
                                Book Appointment
                            </button>
                        </div>
                    ) : filteredPayments.length === 0 ? (
                        <div className="original-empty-state">
                            <p>No payments match your search criteria.</p>
                        </div>
                    ) : (
                        <div className="patient-appt-list">
                            {filteredPayments.map((payment) => (
                                <div className={`appointment-card ${payment.paymentStatus === 'paid' ? 'completed' : payment.paymentStatus === 'failed' ? 'rejected' : 'pending'}`} key={payment.paymentId}>
                                    <div className="appt-doctor">
                                        <div className="appt-avatar">💳</div>
                                        <div>
                                            <div className="appt-name">{payment.doctorName}</div>
                                            <div className="appt-specialty">{payment.doctorSpecialty}</div>
                                        </div>
                                    </div>
                                    <div className="appt-details">
                                        <div className="appt-detail-item">
                                            <div className="appt-detail-label">Amount Paid</div>
                                            <div className="appt-detail-value">
                                                <strong>${payment.amount} {payment.currency?.toUpperCase()}</strong>
                                            </div>
                                        </div>
                                        <div className="appt-detail-item">
                                            <div className="appt-detail-label">Paid At</div>
                                            <div className="appt-detail-value">{formatDate(payment.paidAt)}</div>
                                        </div>
                                        <span className={`status-badge badge-${payment.paymentStatus === 'paid' ? 'completed' : payment.paymentStatus === 'failed' ? 'rejected' : 'pending'}`}>
                                            {payment.paymentStatus?.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="patient-appt-actions">
                                        <button
                                            className="btn-sm btn-sm-outline"
                                            onClick={() => setSelectedPayment(payment)}
                                        >
                                            View Details
                                        </button>

                                        <button
                                            className="btn-sm btn-sm-outline"
                                            disabled
                                            title="Coming Soon"
                                            style={{ opacity: 0.6, cursor: "not-allowed" }}
                                        >
                                            Download Receipt
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Payment Details Modal ─────────────────────────────── */}
            {selectedPayment && (
                <div
                    className="modal-overlay patient-modal-overlay"
                    onClick={() => setSelectedPayment(null)}
                >
                    <div
                        className="modal-content patient-modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: "500px" }}
                    >
                        <div className="patient-modal-header">
                            <h2 className="patient-modal-title">
                                Payment Details
                            </h2>
                            <button
                                onClick={() => setSelectedPayment(null)}
                                className="patient-modal-close-btn"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="payment-details-card" style={{ marginTop: "15px" }}>
                            <div className="summary-row">
                                <span>Doctor</span>
                                <strong>{selectedPayment.doctorName} ({selectedPayment.doctorSpecialty})</strong>
                            </div>
                            <div className="summary-row">
                                <span>Appointment Date</span>
                                <strong>{formatDate(selectedPayment.date)}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Appointment Time</span>
                                <strong>{selectedPayment.time}</strong>
                            </div>
                            <hr style={{ margin: "10px 0", border: "none", borderTop: "1px solid var(--border-color)" }} />
                            <div className="summary-row">
                                <span>Transaction ID</span>
                                <strong>{selectedPayment.transactionId}</strong>
                            </div>
                            {selectedPayment.sessionId && (
                                <div className="summary-row">
                                    <span>Stripe Session</span>
                                    <strong style={{ fontSize: "0.85em", wordBreak: "break-all", marginLeft: "10px", textAlign: "right" }}>{selectedPayment.sessionId}</strong>
                                </div>
                            )}
                            <div className="summary-row">
                                <span>Payment Method</span>
                                <strong>{selectedPayment.paymentMethod?.toUpperCase()}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Status</span>
                                <strong className={`status-badge badge-${selectedPayment.paymentStatus === 'paid' ? 'completed' : selectedPayment.paymentStatus === 'failed' ? 'rejected' : 'pending'}`} style={{ padding: "2px 6px", fontSize: "0.9em" }}>
                                    {selectedPayment.paymentStatus?.toUpperCase()}
                                </strong>
                            </div>
                            <div className="summary-row">
                                <span>Paid At</span>
                                <strong>{formatDateTime(selectedPayment.paidAt)}</strong>
                            </div>
                            <hr style={{ margin: "10px 0", border: "none", borderTop: "1px solid var(--border-color)" }} />
                            <div className="summary-row total">
                                <span>Amount Paid</span>
                                <strong>${selectedPayment.amount} {selectedPayment.currency?.toUpperCase()}</strong>
                            </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                            <button className="btn btn-primary" onClick={() => setSelectedPayment(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default PatientPayments;
