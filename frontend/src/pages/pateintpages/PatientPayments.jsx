import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CardSkeleton from "../../components/loaders/CardSkeleton.jsx";
import PatientNavbar from "../../components/PatientNavbar.jsx";
import { getPaymentHistory } from "../../services/paymentService.js";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "../../context/AuthContext.jsx";
import "./patient.css";

function PatientPayments() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const patientName = user?.name || "Patient";

    // ── State ────────────────────────────────
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");

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

        // Search by Doctor Name, Transaction ID, or Payment Method
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            const doctorMatch = (p.doctorName || "").toLowerCase().includes(query);
            const txnMatch = (p.transactionId || "").toLowerCase().includes(query);
            const methodMatch = (p.paymentMethod || "").toLowerCase().includes(query);
            if (!doctorMatch && !txnMatch && !methodMatch) return false;
        }

        return true;
    });

    // Sort Payments
    filteredPayments.sort((a, b) => {
        const dateA = new Date(a.paidAt || a.date || 0);
        const dateB = new Date(b.paidAt || b.date || 0);

        if (sortOrder === "newest") return dateB - dateA;
        if (sortOrder === "oldest") return dateA - dateB;
        if (sortOrder === "highest") return (b.amount || 0) - (a.amount || 0);
        if (sortOrder === "lowest") return (a.amount || 0) - (b.amount || 0);
        return 0;
    });

    const statusCounts = {
        all: payments.length,
        paid: payments.filter((p) => p.paymentStatus === "paid").length,
        refunded: payments.filter((p) => p.paymentStatus === "refunded").length,
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

    const handleDownloadReceipt = (payment) => {
        if (!payment) {
            toast.error("Payment data is unavailable.");
            return;
        }

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;

            // Colors
            const bgDark = [24, 24, 27];
            const bgCard = [39, 39, 42];
            const accentTeal = [20, 184, 166];  // primary color
            const textWhite = [255, 255, 255];
            const textGray = [161, 161, 170];

            // Background
            doc.setFillColor(...bgDark);
            doc.rect(0, 0, pageWidth, 297, "F");

            // Header Section
            doc.setFillColor(...accentTeal);
            doc.rect(0, 0, pageWidth, 40, "F");

            doc.setTextColor(...textWhite);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text("MediCare Pro", 20, 25);

            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            doc.text("Payment Receipt", pageWidth - 20, 25, { align: "right" });

            // Patient Information
            doc.setFillColor(...bgCard);
            doc.roundedRect(20, 50, pageWidth - 40, 60, 5, 5, "F");

            doc.setTextColor(...accentTeal);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Patient Information", 25, 65);

            doc.setTextColor(...textGray);
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(`Patient Name:`, 25, 80);
            doc.text(`Doctor Name:`, 25, 90);
            doc.text(`Specialty:`, 25, 100);
            doc.text(`Appointment Date:`, pageWidth / 2, 80);
            doc.text(`Appointment Time:`, pageWidth / 2, 90);

            doc.setTextColor(...textWhite);
            doc.setFont("helvetica", "bold");
            doc.text(patientName, 60, 80);
            doc.text(payment.doctorName || "N/A", 60, 90);
            doc.text(payment.doctorSpecialty || "N/A", 60, 100);
            doc.text(formatDate(payment.date), pageWidth / 2 + 40, 80);
            doc.text(payment.time || "N/A", pageWidth / 2 + 40, 90);

            // Payment Information
            doc.setTextColor(...accentTeal);
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.text("Payment Information", 25, 130);

            autoTable(doc, {
                startY: 140,
                margin: { left: 20, right: 20 },
                styles: { fillColor: bgCard, textColor: textWhite, font: "helvetica", fontSize: 10, lineColor: bgDark, lineWidth: 0.1 },
                headStyles: { fillColor: accentTeal, textColor: textWhite, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [45, 45, 48] },
                body: [
                    ["Transaction ID", payment.transactionId || "N/A"],
                    ["Stripe Session ID", payment.sessionId || "N/A"],
                    ["Payment Method", payment.paymentMethod?.toUpperCase() || "N/A"],
                    ["Payment Status", payment.paymentStatus?.toUpperCase() || "N/A"],
                    ["Paid At", formatDateTime(payment.paidAt)],
                ],
                theme: 'grid'
            });

            const finalY = doc.lastAutoTable.finalY || 190;

            // Amount Paid Highlight
            doc.setFillColor(...bgCard);
            doc.roundedRect(20, finalY + 10, pageWidth - 40, 40, 5, 5, "F");
            doc.setTextColor(...textWhite);
            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            doc.text("Amount Paid", 30, finalY + 35);

            doc.setTextColor(...accentTeal);
            doc.setFontSize(24);
            doc.setFont("helvetica", "bold");
            doc.text(`$${payment.amount} ${payment.currency?.toUpperCase()}`, pageWidth - 30, finalY + 36, { align: "right" });

            // Footer
            doc.setTextColor(...textGray);
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.text("Thank you for choosing MediCare Pro.", pageWidth / 2, 270, { align: "center" });
            doc.text("This receipt was automatically generated by the MediCare Pro Healthcare System.", pageWidth / 2, 280, { align: "center" });

            doc.save(`Receipt_${payment.transactionId || "Unknown"}.pdf`);
            toast.success("Receipt downloaded successfully!");
        } catch (err) {
            console.error("PDF Generation Error:", err);
            toast.error("Failed to generate receipt PDF.");
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
                    <div className="patient-payments-header-controls">
                        <div className="patient-payments-search-wrapper">
                            <input
                                type="text"
                                placeholder="Search by Doctor, Transaction ID, or Payment Method..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="form-input patient-payment-search"
                            />
                            <select
                                className="form-select patient-payment-sort"
                                value={sortOrder}
                                onChange={(e) => setSortOrder(e.target.value)}
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest">Highest Amount</option>
                                <option value="lowest">Lowest Amount</option>
                            </select>
                        </div>

                        <div className="filter-tabs">
                            {["all", "paid", "refunded"].map((status) => (
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
                                <div className={`appointment-card ${payment.paymentStatus === 'refunded' ? 'refunded' : 'completed'}`} key={payment.paymentId}>
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
                                        <span className={`status-badge badge-${payment.paymentStatus === 'paid' || payment.paymentStatus === 'succeeded' ? 'completed' : payment.paymentStatus === 'refunded' ? 'refunded' : 'rejected'}`}>
                                            {payment.paymentStatus?.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="patient-appt-actions">
                                        <button
                                            className="btn-sm btn-sm-primary"
                                            onClick={() => setSelectedPayment(payment)}
                                        >
                                            View Details
                                        </button>

                                        <button
                                            className="btn-sm btn-sm-outline patient-payment-outline-btn"
                                            onClick={() => handleDownloadReceipt(payment)}
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
                        className="modal-content patient-modal-content patient-payments-modal-content"
                        onClick={(e) => e.stopPropagation()}
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

                        <div className="payment-details-card patient-payments-modal-body">
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
                            <hr className="patient-payments-modal-divider" />
                            <div className="summary-row">
                                <span>Transaction ID</span>
                                <strong>{selectedPayment.transactionId}</strong>
                            </div>
                            {selectedPayment.sessionId && (
                                <div className="summary-row">
                                    <span>Stripe Session</span>
                                    <strong className="patient-payments-session-val">{selectedPayment.sessionId}</strong>
                                </div>
                            )}
                            <div className="summary-row">
                                <span>Payment Method</span>
                                <strong>{selectedPayment.paymentMethod?.toUpperCase()}</strong>
                            </div>
                            <div className="summary-row">
                                <span>Status</span>
                                <strong className={`status-badge badge-${selectedPayment.paymentStatus === 'paid' || selectedPayment.paymentStatus === 'succeeded' ? 'completed' : selectedPayment.paymentStatus === 'refunded' ? 'refunded' : 'rejected'} patient-payments-status-val`}>
                                    {selectedPayment.paymentStatus?.toUpperCase()}
                                </strong>
                            </div>
                            <div className="summary-row">
                                <span>Paid At</span>
                                <strong>{formatDateTime(selectedPayment.paidAt)}</strong>
                            </div>
                            <hr className="patient-payments-modal-divider" />
                            <div className="summary-row total">
                                <span>Amount Paid</span>
                                <strong>${selectedPayment.amount} {selectedPayment.currency?.toUpperCase()}</strong>
                            </div>
                        </div>

                        <div className="patient-payments-modal-footer">
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
