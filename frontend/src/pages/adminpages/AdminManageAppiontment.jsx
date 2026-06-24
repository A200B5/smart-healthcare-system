import AdminNavbar from "../../components/AdminNavbar.jsx";
import React, { useState, useEffect } from "react";
import TableSkeleton from "../../components/loaders/TableSkeleton.jsx";
import { getAppointments, deleteAppointment } from "../../services/adminService.js";
import ConfirmationModal from "../../components/ConfirmationModal.jsx";
import AlertModal from "../../components/AlertModal.jsx";

function AdminManageAppiontment() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [appointmentToDelete, setAppointmentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [alertInfo, setAlertInfo] = useState({ isOpen: false, message: "" });

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await getAppointments();
            if (res && res.success) {
                setAppointments(res.appointments || []);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load appointments");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (appointment) => {
        setAppointmentToDelete(appointment);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!appointmentToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteAppointment(appointmentToDelete.id);
            if (res && res.success) {
                setShowDeleteModal(false);
                setAppointmentToDelete(null);
                fetchAppointments();
            }
        } catch (err) {
            setAlertInfo({ isOpen: true, message: err.message || "Failed to delete appointment" });
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const filteredAppointments = appointments.filter(app => {
        const matchesStatus = statusFilter === "all" || app.status === statusFilter;
        const searchTarget = `${app.patientName} ${app.doctorName} ${app.doctorSpecialty}`.toLowerCase();
        const matchesSearch = searchTarget.includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const statusCounts = {
        all: appointments.length,
        pending: appointments.filter(a => a.status === 'pending').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        rejected: appointments.filter(a => a.status === 'rejected').length
    };

    return (
        <>
            <AdminNavbar />
            <div className="page" id="page-admin-appointments">
                <div className="page-content">
                    <h1 className="page-title">All Appointments</h1>
                    <p className="page-subtitle">Monitor and manage all appointments across the platform</p>

                    <div className="filter-tabs">
                        <button className={`filter-tab ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>All ({statusCounts.all})</button>
                        <button className={`filter-tab ${statusFilter === "pending" ? "active" : ""}`} onClick={() => setStatusFilter("pending")}>Pending ({statusCounts.pending})</button>
                        <button className={`filter-tab ${statusFilter === "confirmed" ? "active" : ""}`} onClick={() => setStatusFilter("confirmed")}>Confirmed ({statusCounts.confirmed})</button>
                        <button className={`filter-tab ${statusFilter === "completed" ? "active" : ""}`} onClick={() => setStatusFilter("completed")}>Completed ({statusCounts.completed})</button>
                        <button className={`filter-tab ${statusFilter === "rejected" ? "active" : ""}`} onClick={() => setStatusFilter("rejected")}>Rejected ({statusCounts.rejected})</button>
                    </div>

                    <div className="table-card">
                        <div className="table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div className="table-title">Appointments List</div>
                            <input 
                                className="form-input"
                                type="text" 
                                placeholder="Search patient, doctor, or specialty..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '300px' }}
                            />
                        </div>
                        
                        {loading ? (
                            <TableSkeleton rows={5} columns={6} />
                        ) : error ? (
                            <p style={{ padding: '1rem', color: 'red' }}>{error}</p>
                        ) : filteredAppointments.length === 0 ? (
                            <p style={{ padding: '1rem' }}>No appointments found.</p>
                        ) : (
                            <table>
                                <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Specialty</th>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Fee</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredAppointments.map(app => (
                                    <tr key={app.id}>
                                        <td>
                                            <div className="table-avatar">👤 {app.patientName}</div>
                                        </td>
                                        <td>{app.doctorName}</td>
                                        <td className="table-specialty">{app.doctorSpecialty}</td>
                                        <td>{new Date(app.date).toLocaleDateString()}</td>
                                        <td>{app.time}</td>
                                        <td>${app.doctorPrice || 0}</td>
                                        <td>
                                            <span className={`status-badge badge-${app.status}`}>
                                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-auth" 
                                                onClick={() => confirmDelete(app)}
                                                style={{ padding: '0.25rem 0.5rem', background: '#EF4444', minWidth: 'auto', fontSize: '0.875rem' }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmationModal 
                isOpen={showDeleteModal}
                title="Delete Appointment"
                message={`Are you sure you want to permanently remove the appointment with ${appointmentToDelete?.doctorName}?`}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
                confirmText={isDeleting ? "Deleting..." : "Delete Appointment"}
                cancelText="Cancel"
                isDanger={true}
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

export default AdminManageAppiontment;