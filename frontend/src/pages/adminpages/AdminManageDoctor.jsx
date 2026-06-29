import AdminNavbar from "../../components/AdminNavbar.jsx";
import { useState, useEffect } from "react";
import TableSkeleton from "../../components/loaders/TableSkeleton.jsx";
import { useNavigate } from "react-router-dom";
import { getDoctors, deleteDoctor, approveDoctor, rejectDoctor } from "../../services/adminService.js";
import ConfirmationModal from "../../components/ConfirmationModal.jsx";
import AlertModal from "../../components/AlertModal.jsx";
import "./admin.css";

function AdminManageDoctor() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [openDropdownId, setOpenDropdownId] = useState(null);
    
    // Reject Modal State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [doctorToDelete, setDoctorToDelete] = useState(null);

    // New Modals State
    const [confirmApprove, setConfirmApprove] = useState({ isOpen: false, doctorId: null });
    const [alertInfo, setAlertInfo] = useState({ isOpen: false, message: "" });

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const res = await getDoctors();
            if (res && res.success) {
                setDoctors(res.data || []);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load doctors");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (doctor) => {
        console.log("confirmDelete triggered with doctor:", doctor);
        setDoctorToDelete(doctor);
        setShowDeleteModal(true);
        console.log("showDeleteModal set to true");
    };

    const handleDelete = async () => {
        console.log("handleDelete called, doctorToDelete:", doctorToDelete);
        if (!doctorToDelete) return;
        setIsSubmitting(true);
        try {
            console.log("Calling deleteDoctor API with ID:", doctorToDelete.doctorId);
            const res = await deleteDoctor(doctorToDelete.doctorId);
            console.log("deleteDoctor API response:", res);
            if (res && res.success) {
                setShowDeleteModal(false);
                setDoctorToDelete(null);
                fetchDoctors();
            }
        } catch (err) {
            console.error("deleteDoctor API error:", err);
            setAlertInfo({ isOpen: true, message: err.message || "Failed to delete doctor" });
        } finally {
            setIsSubmitting(false);
        }
    };

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
                fetchDoctors();
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
                fetchDoctors();
            }
        } catch (err) {
            setAlertInfo({ isOpen: true, message: err.message || "Failed to reject doctor" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleDropdown = (id) => {
        setOpenDropdownId(openDropdownId === id ? null : id);
    };

    useEffect(() => {
        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doc => 
        (doc.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.specialty || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <AdminNavbar />
            <div className="page" id="page-admin-doctors">
                <div className="page-content">
                    <h1 className="page-title">Manage Doctors</h1>
                    <p className="page-subtitle">View and manage all registered doctors</p>

                    <div className="table-card">
                        <div className="table-header">
                            <div className="table-title">All Doctors ({filteredDoctors.length})</div>
                            <input 
                                className="form-input admin-doctors-search"
                                type="text" 
                                placeholder="Search by name, email, or specialty..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {loading ? (
                            <TableSkeleton rows={5} columns={6} />
                        ) : error ? (
                            <p className="admin-dashboard-error">{error}</p>
                        ) : filteredDoctors.length === 0 ? (
                            <p className="admin-doctors-empty">No doctors found.</p>
                        ) : (
                            <table>
                                <thead>
                                <tr>
                                    <th>Doctor Name</th>
                                    <th>Email</th>
                                    <th>Specialty</th>
                                    <th>Experience</th>
                                    <th>Fee</th>
                                    <th>Status</th>
                                    <th>Verification</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredDoctors.map((doc, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <div className="table-avatar">👤 {doc.name}</div>
                                        </td>
                                        <td>{doc.email}</td>
                                        <td className="table-specialty">{doc.specialty || 'N/A'}</td>
                                        <td>{doc.experience ? `${doc.experience}y` : 'N/A'}</td>
                                        <td>${doc.price || 0}</td>
                                        <td>
                                            {doc.available ? (
                                                <span className="status-badge status-available">Available</span>
                                            ) : (
                                                <span className="status-badge status-busy">Busy/Offline</span>
                                            )}
                                        </td>
                                        <td>
                                            {doc.verificationStatus === 'approved' ? (
                                                <span className="status-badge status-available">Approved</span>
                                            ) : doc.verificationStatus === 'pending' ? (
                                                <span className="status-badge status-busy">Pending</span>
                                            ) : (
                                                <span className="status-badge status-rejected">Rejected</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="admin-doctors-action-wrap">
                                                <button 
                                                    onClick={() => toggleDropdown(doc.doctorId)} 
                                                    className="admin-doctors-btn-dots"
                                                >
                                                    ⋮
                                                </button>
                                                {openDropdownId === doc.doctorId && (
                                                    <div className="admin-doctors-dropdown">
                                                        <button 
                                                            onClick={() => { navigate(`/admin/doctor/${doc.doctorId}`); toggleDropdown(null); }} 
                                                            className="admin-doctors-dropdown-item admin-doctors-item-default"
                                                            onMouseEnter={(e) => e.target.style.background = 'var(--bg-primary)'}
                                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                        >
                                                            View Details
                                                        </button>
                                                        {doc.verificationStatus === 'pending' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => { handleApproveClick(doc.doctorId); toggleDropdown(null); }} 
                                                                    className="admin-doctors-dropdown-item admin-doctors-item-approve"
                                                                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-primary)'}
                                                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                                >
                                                                    Approve Doctor
                                                                </button>
                                                                <button 
                                                                    onClick={() => { handleRejectClick(doc.doctorId); toggleDropdown(null); }} 
                                                                    className="admin-doctors-dropdown-item admin-doctors-item-reject"
                                                                    onMouseEnter={(e) => e.target.style.background = 'var(--bg-primary)'}
                                                                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                                >
                                                                    Reject Doctor
                                                                </button>
                                                            </>
                                                        )}
                                                        <div className="admin-doctors-divider"></div>
                                                        <button 
                                                            onClick={(e) => { 
                                                                console.log("Delete button clicked!");
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                confirmDelete(doc); 
                                                                toggleDropdown(null); 
                                                            }} 
                                                            className="admin-doctors-dropdown-item admin-doctors-item-delete"
                                                            onMouseEnter={(e) => e.target.style.background = 'var(--bg-primary)'}
                                                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                                        >
                                                            Delete Doctor
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Reject Doctor Verification</h3>
                            <button className="close-btn" onClick={() => setShowRejectModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleRejectSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Reason for Rejection</label>
                                    <textarea 
                                        className="form-input"
                                        rows="4" 
                                        placeholder="Please provide a reason for rejecting this verification..."
                                        value={rejectReason}
                                        onChange={(e) => setRejectReason(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setShowRejectModal(false)}>Cancel</button>
                                <button type="submit" className="btn-auth admin-doctors-btn-confirm" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            <ConfirmationModal 
                isOpen={showDeleteModal}
                title="Delete Doctor"
                message={`Are you sure you want to permanently remove ${doctorToDelete?.name}? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
                confirmText={isSubmitting ? "Deleting..." : "Delete Doctor"}
                cancelText="Cancel"
                isDanger={true}
            />

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
    )
}

export default AdminManageDoctor;