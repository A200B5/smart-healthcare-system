import AdminNavbar from "../../components/AdminNavbar.jsx";
import { useState, useEffect } from "react";
import TableSkeleton from "../../components/loaders/TableSkeleton.jsx";
import { getPendingDoctors, approveDoctor, rejectDoctor, getAdminStats } from "../../services/adminService.js";
import ConfirmationModal from "../../components/ConfirmationModal.jsx";
import AlertModal from "../../components/AlertModal.jsx";
import "./admin.css";

function AdminDashboard() {
    const [pendingDoctors, setPendingDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [stats, setStats] = useState(null);

    // Modal State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Modals State
    const [confirmApprove, setConfirmApprove] = useState({ isOpen: false, doctorId: null });
    const [alertInfo, setAlertInfo] = useState({ isOpen: false, message: "" });

    const fetchPendingDoctors = async () => {
        setLoading(true);
        try {
            const res = await getPendingDoctors();
            if (res && res.success) {
                setPendingDoctors(res.data || []);
            }
        } catch (err) {
            console.error(err);
            setErrorMsg("Failed to load pending doctors");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await getAdminStats();
            if (res && res.success) {
                setStats(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPendingDoctors();
        fetchStats();
    }, []);

    const handleApproveClick = (doctorId) => {
        setConfirmApprove({ isOpen: true, doctorId });
    };

    const handleConfirmApprove = async () => {
        const doctorId = confirmApprove.doctorId;
        setConfirmApprove({ isOpen: false, doctorId: null });
        if (!doctorId) return;

        try {
            const res = await approveDoctor(doctorId);
            if (res && res.success) {
                // Refresh list
                fetchPendingDoctors();
            }
        } catch (err) {
            setAlertInfo({ isOpen: true, message: err.message || "Failed to approve doctor" });
        }
    };

    const handleRejectClick = (doctorId) => {
        setSelectedDoctorId(doctorId);
        setRejectReason("");
        setShowRejectModal(true);
    };

    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        if (!rejectReason.trim()) {
            setAlertInfo({ isOpen: true, message: "Rejection reason is required" });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await rejectDoctor(selectedDoctorId, rejectReason);
            if (res && res.success) {
                setShowRejectModal(false);
                fetchPendingDoctors();
            }
        } catch (err) {
            setAlertInfo({ isOpen: true, message: err.message || "Failed to reject doctor" });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <AdminNavbar pendingCount={pendingDoctors.length} />
            <div className="page" id="page-admin-dashboard">
                <div className="page-content">
                    <div className="welcome-banner">
                        <div className="welcome-text">
                            <h2>Admin Dashboard 🔑</h2>
                            <p>Platform overview and analytics</p>
                        </div>
                        <div className="welcome-icon"></div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card-dash">

                            <div className="number teal">{stats ? stats.totalDoctors : "..."}</div>
                            <div className="label">Total Doctors</div>
                            <div className="sublabel">{stats ? stats.availableDoctors : "..."} available</div>
                        </div>
                        <div className="stat-card-dash">

                            <div className="number teal">{stats ? stats.totalAppointments : "..."}</div>
                            <div className="label">Total Appointments</div>
                            <div className="sublabel">{stats ? stats.pendingAppointments : "..."} pending</div>
                        </div>
                        <div className="stat-card-dash">

                            <div className="number green">{stats ? stats.confirmedAppointments : "..."}</div>
                            <div className="label">Confirmed</div>
                            <div className="sublabel">appointments</div>
                        </div>
                        <div className="stat-card-dash">

                            <div className="number gold">${stats ? (stats.totalRevenue || 0).toLocaleString() : "..."}</div>
                            <div className="label">Revenue</div>
                            <div className="sublabel">total lifetime</div>
                        </div>
                    </div>

                    {/* Doctor Verification Section */}
                    <div className="table-card admin-dashboard-section">
                        <div className="table-title">Doctor Verification Management</div>

                        {loading ? (
                            <TableSkeleton rows={3} columns={5} />
                        ) : errorMsg ? (
                            <p className="admin-dashboard-error">{errorMsg}</p>
                        ) : pendingDoctors.length === 0 ? (
                            <div className="success-msg admin-dashboard-success-wrap">
                                ✅ <span>No pending verifications. All caught up!</span>
                            </div>
                        ) : (
                            <table>
                                <thead>
                                    <tr>
                                        <th>Doctor Name</th>
                                        <th>Email</th>
                                        <th>Specialty</th>
                                        <th>Experience</th>
                                        <th>Location</th>
                                        <th>License Number</th>
                                        <th>Submitted Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingDoctors.map(doctor => (
                                        <tr key={doctor.doctorId}>
                                            <td>
                                                <div className="table-avatar">👤 {doctor.name}</div>
                                            </td>
                                            <td>{doctor.email}</td>
                                            <td className="table-specialty">{doctor.specialty}</td>
                                            <td>{doctor.experience} yrs</td>
                                            <td>{doctor.location}</td>
                                            <td>{doctor.licenseNumber}</td>
                                            <td>{new Date(doctor.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <div className="admin-dashboard-actions">
                                                    <button
                                                        onClick={() => handleApproveClick(doctor.doctorId)}
                                                        className="btn-auth admin-dashboard-btn-approve"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRejectClick(doctor.doctorId)}
                                                        className="btn-auth admin-dashboard-btn-reject"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    <div className="charts-grid admin-dashboard-section">
                        <div className="chart-card">
                            <div className="chart-title">Appointment Status Breakdown</div>
                            {stats ? (
                                <div className="admin-dashboard-chart-list">
                                    <div>
                                        <div className="admin-dashboard-chart-label-row">
                                            <span>Completed</span>
                                            <span>{stats.completedAppointments}</span>
                                        </div>
                                        <div className="admin-dashboard-progress-wrap">
                                            <div className="admin-dashboard-progress-fill admin-dashboard-progress-teal" style={{ width: `${stats.totalAppointments ? (stats.completedAppointments / stats.totalAppointments) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="admin-dashboard-chart-label-row">
                                            <span>Confirmed</span>
                                            <span>{stats.confirmedAppointments}</span>
                                        </div>
                                        <div className="admin-dashboard-progress-wrap">
                                            <div className="admin-dashboard-progress-fill admin-dashboard-progress-confirmed" style={{ width: `${stats.totalAppointments ? (stats.confirmedAppointments / stats.totalAppointments) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="admin-dashboard-chart-label-row">
                                            <span>Pending</span>
                                            <span>{stats.pendingAppointments}</span>
                                        </div>
                                        <div className="admin-dashboard-progress-wrap">
                                            <div className="admin-dashboard-progress-fill admin-dashboard-progress-pending" style={{ width: `${stats.totalAppointments ? (stats.pendingAppointments / stats.totalAppointments) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="admin-dashboard-chart-label-row">
                                            <span>Rejected</span>
                                            <span>{stats.rejectedAppointments}</span>
                                        </div>
                                        <div className="admin-dashboard-progress-wrap">
                                            <div className="admin-dashboard-progress-fill admin-dashboard-progress-rejected" style={{ width: `${stats.totalAppointments ? (stats.rejectedAppointments / stats.totalAppointments) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p>Loading stats...</p>
                            )}
                        </div>

                        <div className="chart-card">
                            <div className="chart-title">System Overview</div>
                            {stats ? (
                                <div className="admin-dashboard-chart-list">
                                    <div className="admin-dashboard-stat-box">
                                        <div className="admin-dashboard-stat-number">{stats.totalUsers}</div>
                                        <div className="admin-dashboard-stat-label">Registered Users</div>
                                    </div>
                                    <div className="admin-dashboard-stat-box">
                                        <div className="admin-dashboard-stat-number">{stats.totalPatients}</div>
                                        <div className="admin-dashboard-stat-label">Active Patients</div>
                                    </div>
                                    <div className="admin-dashboard-stat-box">
                                        <div className="admin-dashboard-stat-number">{stats.todayAppointments}</div>
                                        <div className="admin-dashboard-stat-label">Appointments Booked Today</div>
                                    </div>
                                </div>
                            ) : (
                                <p>Loading stats...</p>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay admin-dashboard-modal-overlay">
                    <div className="auth-card admin-dashboard-modal-card">
                        <h2 className="auth-title admin-dashboard-modal-title">Reject Doctor Verification</h2>
                        <form onSubmit={handleRejectSubmit}>
                            <div className="form-group">
                                <label className="form-label">Rejection Reason</label>
                                <textarea
                                    className="form-input admin-dashboard-textarea"
                                    placeholder="Please provide a clear reason for rejection..."
                                    required
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="admin-dashboard-modal-actions">
                                <button
                                    type="button"
                                    className="btn-auth admin-dashboard-btn-cancel"
                                    onClick={() => setShowRejectModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-auth admin-dashboard-btn-confirm"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Submitting..." : "Confirm Reject"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmApprove.isOpen}
                title="Approve Doctor"
                message="Are you sure you want to approve this doctor?"
                confirmText="Approve"
                cancelText="Cancel"
                onConfirm={handleConfirmApprove}
                onCancel={() => setConfirmApprove({ isOpen: false, doctorId: null })}
                isDanger={false}
            />

            <AlertModal
                isOpen={alertInfo.isOpen}
                title="Notice"
                message={alertInfo.message}
                onClose={() => setAlertInfo({ isOpen: false, message: "" })}
            />
        </>
    );
}

export default AdminDashboard;