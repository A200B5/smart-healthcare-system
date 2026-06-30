import { useState, useEffect } from "react";
import { getRecentTransactions, refundPayment } from "../../services/adminService.js";
import TableSkeleton from "../../components/loaders/TableSkeleton.jsx";
import AlertModal from "../../components/AlertModal.jsx";
import ConfirmationModal from "../../components/ConfirmationModal.jsx";
import { toast } from "react-toastify";

const TransactionDetailsModal = ({ transaction, onClose, onRefundSuccess }) => {
    const [showRefundConfirm, setShowRefundConfirm] = useState(false);
    const [isRefunding, setIsRefunding] = useState(false);

    if (!transaction) return null;

    const isRefundable = (transaction.paymentStatus === 'paid' || transaction.paymentStatus === 'succeeded') &&
        transaction.refundStatus !== 'refunded';

    const handleRefundConfirm = async () => {
        setIsRefunding(true);
        try {
            const res = await refundPayment(transaction.paymentId, "requested_by_customer");
            if (res && res.success) {
                toast.success("Payment refunded successfully.");
                if (onRefundSuccess) onRefundSuccess(res.refund);
            }
        } catch (err) {
            toast.error(err.message || "Refund failed.");
        } finally {
            setIsRefunding(false);
            setShowRefundConfirm(false);
        }
    };

    return (
        <>
            <AlertModal
                isOpen={!showRefundConfirm}
                title="Transaction Details"
                buttonText="Close"
                onClose={onClose}
                maxWidth="600px"
                showCloseIcon={true}
                customActions={
                    isRefundable ? (
                        <button
                            className="btn btn-primary admin-refund-action-btn"
                            onClick={() => setShowRefundConfirm(true)}
                        >
                            <i className="fas fa-undo-alt"></i> Refund Payment
                        </button>
                    ) : null
                }
            >
                <div className="admin-transaction-modal-grid">
                    <div>
                        <div className="form-label">Transaction ID</div>
                        <div className="admin-transaction-val-bold">{transaction.transactionId}</div>
                    </div>
                    <div>
                        <div className="form-label">Stripe Session ID</div>
                        <div className="admin-transaction-val-sub">{transaction.stripeSessionId || "N/A"}</div>
                    </div>
                    <div>
                        <div className="form-label">Patient</div>
                        <div>{transaction.patientName}</div>
                    </div>
                    <div>
                        <div className="form-label">Doctor</div>
                        <div>{transaction.doctorName}</div>
                    </div>
                    <div>
                        <div className="form-label">Appointment Date</div>
                        <div>{new Date(transaction.appointmentDate).toLocaleDateString()} at {transaction.appointmentTime}</div>
                    </div>
                    <div>
                        <div className="form-label">Appointment Status</div>
                        <div className="admin-transaction-val-cap">{transaction.appointmentStatus}</div>
                    </div>
                    <div>
                        <div className="form-label">Amount Paid</div>
                        <div className="admin-transaction-val-amount">
                            {transaction.amount.toLocaleString(undefined, { style: "currency", currency: transaction.currency.toUpperCase() })}
                        </div>
                    </div>
                    <div>
                        <div className="form-label">Payment Method</div>
                        <div className="admin-transaction-val-cap">{transaction.paymentMethod}</div>
                    </div>
                    <div>
                        <div className="form-label">Payment Status</div>
                        <div>
                            <span className={`status-badge ${(transaction.paymentStatus === 'succeeded' || transaction.paymentStatus === 'paid') ? 'badge-completed' : 'badge-rejected'
                                }`}>
                                {(transaction.paymentStatus === 'succeeded' || transaction.paymentStatus === 'paid') ? 'Paid' : 'Refunded'}
                            </span>
                        </div>
                    </div>
                    <div>
                        <div className="form-label">Paid At</div>
                        <div>{transaction.paidAt ? new Date(transaction.paidAt).toLocaleString() : "N/A"}</div>
                    </div>

                    {transaction.refundStatus && (
                        <>
                            <div>
                                <div className="form-label">Refund Status</div>
                                <div className="admin-transaction-val-cap">{transaction.refundStatus}</div>
                            </div>
                            <div>
                                <div className="form-label">Refund Amount</div>
                                <div className="admin-transaction-val-amount" style={{ color: "var(--danger-color, #ef4444)" }}>
                                    {(transaction.refundAmount || transaction.amount).toLocaleString(undefined, { style: "currency", currency: transaction.currency.toUpperCase() })}
                                </div>
                            </div>
                            <div>
                                <div className="form-label">Refund Date</div>
                                <div>{transaction.refundedAt ? new Date(transaction.refundedAt).toLocaleString() : "N/A"}</div>
                            </div>
                            <div>
                                <div className="form-label">Refund ID</div>
                                <div className="admin-transaction-val-sub">{transaction.refundId || "N/A"}</div>
                            </div>
                            {transaction.stripeRefundId && (
                                <div>
                                    <div className="form-label">Stripe Refund ID</div>
                                    <div className="admin-transaction-val-sub">{transaction.stripeRefundId}</div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </AlertModal>

            {showRefundConfirm && (
                <ConfirmationModal
                    isOpen={true}
                    title="Refund Payment"
                    message={
                        <div>
                            <p>Are you sure you want to refund this payment?</p>
                            <ul style={{ listStyleType: "none", padding: 0, margin: "10px 0" }}>
                                <li><strong>Patient:</strong> {transaction.patientName}</li>
                                <li><strong>Doctor:</strong> {transaction.doctorName}</li>
                                <li><strong>Amount:</strong> {transaction.amount.toLocaleString(undefined, { style: "currency", currency: transaction.currency.toUpperCase() })}</li>
                                <li><strong>Transaction ID:</strong> {transaction.transactionId}</li>
                            </ul>
                            <p style={{ color: "var(--danger-color, #ef4444)", fontWeight: "bold" }}>This action cannot be undone.</p>
                        </div>
                    }
                    confirmText={isRefunding ? "Refunding..." : "Refund"}
                    cancelText="Cancel"
                    onConfirm={handleRefundConfirm}
                    onCancel={() => setShowRefundConfirm(false)}
                    isDanger={true}
                />
            )}
        </>
    );
};

const RecentTransactions = ({ refreshTrigger, onRefundSuccess }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [sortFilter, setSortFilter] = useState("newest");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTx, setSelectedTx] = useState(null);

    const fetchTransactions = async () => {
        setLoading(true);
        setErrorMsg("");
        try {
            const params = {
                status: statusFilter,
                sort: sortFilter,
                search: searchQuery
            };
            const res = await getRecentTransactions(params);
            if (res && res.success) {
                setTransactions(res.data);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Failed to load recent transactions");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTransactions();
        }, 300); // debounce search input

        return () => clearTimeout(delayDebounceFn);
    }, [statusFilter, sortFilter, searchQuery, refreshTrigger]);

    const handleTransactionRefunded = (refundData) => {
        if (onRefundSuccess) onRefundSuccess();

        // Also update local state to hide modal immediately and show accurate data before refetch
        setTransactions(prev => prev.map(t =>
            t.paymentId === refundData.paymentId
                ? { ...t, paymentStatus: 'refunded', refundStatus: refundData.refundStatus, refundAmount: refundData.refundAmount, refundedAt: refundData.refundedAt, refundId: refundData.refundId, stripeRefundId: refundData.stripeRefundId }
                : t
        ));

        setSelectedTx(prev => ({
            ...prev,
            paymentStatus: 'refunded',
            refundStatus: refundData.refundStatus,
            refundAmount: refundData.refundAmount,
            refundedAt: refundData.refundedAt,
            refundId: refundData.refundId,
            stripeRefundId: refundData.stripeRefundId
        }));
    };

    return (
        <div className="table-card admin-dashboard-section admin-transaction-section-wrap">
            <div className="admin-transaction-header">
                <div className="table-title">Recent Transactions</div>
            </div>

            <div className="admin-transaction-filters">
                <input
                    type="text"
                    className="form-input admin-transaction-search-input"
                    placeholder="Search by Patient, Doctor or Transaction ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />

                <select
                    className="form-input admin-transaction-select-input"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Statuses</option>
                    <option value="succeeded">Paid</option>
                    <option value="refunded">Refunded</option>
                </select>

                <select
                    className="form-input admin-transaction-select-input"
                    value={sortFilter}
                    onChange={(e) => setSortFilter(e.target.value)}
                >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Amount</option>
                    <option value="lowest">Lowest Amount</option>
                </select>
            </div>

            {loading ? (
                <TableSkeleton rows={5} columns={6} />
            ) : errorMsg ? (
                <p className="admin-dashboard-error">{errorMsg}</p>
            ) : transactions.length === 0 ? (
                <div className="admin-transaction-empty">

                    <h3>No Transactions Found</h3>
                    <p>Try adjusting your filters or search query.</p>
                </div>
            ) : (
                <div className="admin-transaction-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Doctor</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.paymentId}>
                                    <td>{tx.patientName}</td>
                                    <td>{tx.doctorName}</td>
                                    <td>{new Date(tx.paidAt || tx.createdAt).toLocaleDateString()}</td>
                                    <td className="admin-transaction-amount-cell">
                                        {tx.amount.toLocaleString(undefined, { style: "currency", currency: tx.currency.toUpperCase() })}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${(tx.paymentStatus === 'succeeded' || tx.paymentStatus === 'paid') ? 'badge-completed' : 'badge-rejected'
                                            }`}>
                                            {(tx.paymentStatus === 'succeeded' || tx.paymentStatus === 'paid') ? 'Paid' : 'Refunded'}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="admin-transaction-details-btn"
                                            onClick={() => setSelectedTx(tx)}
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedTx && (
                <TransactionDetailsModal
                    transaction={selectedTx}
                    onClose={() => setSelectedTx(null)}
                    onRefundSuccess={handleTransactionRefunded}
                />
            )}
        </div>
    );
};

export default RecentTransactions;
