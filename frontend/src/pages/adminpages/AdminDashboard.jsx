import AdminNavbar from "../../components/AdminNavbar.jsx";
import React, { useState, useEffect } from "react";
import TableSkeleton from "../../components/loaders/TableSkeleton.jsx";
import { getPendingDoctors, approveDoctor, rejectDoctor, getAdminStats } from "../../services/adminService.js";

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

    const handleApprove = async (doctorId) => {
        if (!window.confirm("Are you sure you want to approve this doctor?")) return;
        
        try {
            const res = await approveDoctor(doctorId);
            if (res && res.success) {
                // Refresh list
                fetchPendingDoctors();
            }
        } catch (err) {
            alert(err.message || "Failed to approve doctor");
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
            alert("Rejection reason is required");
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
            alert(err.message || "Failed to reject doctor");
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
                            <div className="icon">👨‍⚕️</div>
                            <div className="number teal">{stats ? stats.totalDoctors : "..."}</div>
                            <div className="label">Total Doctors</div>
                            <div className="sublabel">{stats ? stats.availableDoctors : "..."} available</div>
                        </div>
                        <div className="stat-card-dash">
                            <div className="icon">📅</div>
                            <div className="number teal">{stats ? stats.totalAppointments : "..."}</div>
                            <div className="label">Total Appointments</div>
                            <div className="sublabel">{stats ? stats.pendingAppointments : "..."} pending</div>
                        </div>
                        <div className="stat-card-dash">
                            <div className="icon">✅</div>
                            <div className="number green">{stats ? stats.confirmedAppointments : "..."}</div>
                            <div className="label">Confirmed</div>
                            <div className="sublabel">appointments</div>
                        </div>
                        <div className="stat-card-dash">
                            <div className="icon">💰</div>
                            <div className="number gold">${stats ? (stats.totalRevenue || 0).toLocaleString() : "..."}</div>
                            <div className="label">Revenue</div>
                            <div className="sublabel">total lifetime</div>
                        </div>
                    </div>

                    {/* Doctor Verification Section */}
                    <div className="table-card" style={{ marginTop: '2rem' }}>
                        <div className="table-title">Doctor Verification Management</div>
                        
                        {loading ? (
                            <TableSkeleton rows={3} columns={5} />
                        ) : errorMsg ? (
                            <p style={{ padding: '1rem', color: 'red' }}>{errorMsg}</p>
                        ) : pendingDoctors.length === 0 ? (
                            <div className="success-msg" style={{ display: 'block', margin: '1rem' }}>
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
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button 
                                                        onClick={() => handleApprove(doctor.doctorId)}
                                                        className="btn-auth" 
                                                        style={{ padding: '0.25rem 0.5rem', background: '#10B981', minWidth: 'auto', fontSize: '0.875rem' }}
                                                    >
                                                        Approve
                                                    </button>
                                                    <button 
                                                        onClick={() => handleRejectClick(doctor.doctorId)}
                                                        className="btn-auth" 
                                                        style={{ padding: '0.25rem 0.5rem', background: '#EF4444', minWidth: 'auto', fontSize: '0.875rem' }}
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

                    <div className="charts-grid" style={{ marginTop: '2rem' }}>
                        <div className="chart-card">
                            <div className="chart-title">Appointment Status Breakdown</div>
                            {stats ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '14px' }}>
                                            <span>Completed</span>
                                            <span>{stats.completedAppointments}</span>
                                        </div>
                                        <div style={{ width: '100%', backgroundColor: 'var(--border-color)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                                            <div style={{ width: `${stats.totalAppointments ? (stats.completedAppointments / stats.totalAppointments) * 100 : 0}%`, backgroundColor: 'var(--primary-teal)', height: '100%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '14px' }}>
                                            <span>Confirmed</span>
                                            <span>{stats.confirmedAppointments}</span>
                                        </div>
                                        <div style={{ width: '100%', backgroundColor: 'var(--border-color)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                                            <div style={{ width: `${stats.totalAppointments ? (stats.confirmedAppointments / stats.totalAppointments) * 100 : 0}%`, backgroundColor: 'var(--confirmed)', height: '100%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '14px' }}>
                                            <span>Pending</span>
                                            <span>{stats.pendingAppointments}</span>
                                        </div>
                                        <div style={{ width: '100%', backgroundColor: 'var(--border-color)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                                            <div style={{ width: `${stats.totalAppointments ? (stats.pendingAppointments / stats.totalAppointments) * 100 : 0}%`, backgroundColor: 'var(--pending)', height: '100%' }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '14px' }}>
                                            <span>Rejected</span>
                                            <span>{stats.rejectedAppointments}</span>
                                        </div>
                                        <div style={{ width: '100%', backgroundColor: 'var(--border-color)', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
                                            <div style={{ width: `${stats.totalAppointments ? (stats.rejectedAppointments / stats.totalAppointments) * 100 : 0}%`, backgroundColor: 'var(--rejected)', height: '100%' }}></div>
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
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                    <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-teal)' }}>{stats.totalUsers}</div>
                                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Registered Users</div>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-teal)' }}>{stats.totalPatients}</div>
                                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Active Patients</div>
                                    </div>
                                    <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-teal)' }}>{stats.todayAppointments}</div>
                                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Appointments Booked Today</div>
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
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="auth-card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
                        <h2 className="auth-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Reject Doctor Verification</h2>
                        <form onSubmit={handleRejectSubmit}>
                            <div className="form-group">
                                <label className="form-label">Rejection Reason</label>
                                <textarea 
                                    className="form-input" 
                                    style={{ minHeight: '100px', resize: 'vertical' }}
                                    placeholder="Please provide a clear reason for rejection..."
                                    required
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                ></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button 
                                    type="button" 
                                    className="btn-auth" 
                                    style={{ background: '#6B7280' }}
                                    onClick={() => setShowRejectModal(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn-auth" 
                                    style={{ background: '#EF4444' }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Submitting..." : "Confirm Reject"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminDashboard;