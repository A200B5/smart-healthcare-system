import AdminNavbar from "../../components/AdminNavbar.jsx";
import { useState, useEffect } from "react";
import TableSkeleton from "../../components/loaders/TableSkeleton.jsx";
import { getUsers, deleteUser } from "../../services/adminService.js";
import ConfirmationModal from "../../components/ConfirmationModal.jsx";
import AlertModal from "../../components/AlertModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function AdminManageUser() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const { user: currentUser } = useAuth();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [alertInfo, setAlertInfo] = useState({ isOpen: false, message: "" });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getUsers();
            if (res && res.success) {
                setUsers(res.data || []);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = (user) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const handleDelete = async () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        try {
            const res = await deleteUser(userToDelete.id);
            if (res && res.success) {
                setShowDeleteModal(false);
                setUserToDelete(null);
                fetchUsers();
            }
        } catch (err) {
            setAlertInfo({ isOpen: true, message: err.message || "Failed to delete user" });
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const matchesRole = roleFilter === "all" || user.role === roleFilter;
        const matchesSearch = (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (user.email || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesRole && matchesSearch;
    });

    return (
        <>
            <AdminNavbar />
            <div className="page" id="page-admin-users">
                <div className="page-content">
                    <h1 className="page-title">Manage Users</h1>
                    <p className="page-subtitle">View and manage all platform users</p>

                    <div className="table-card">
                        <div className="table-header" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                <div className="table-title">All Users ({filteredUsers.length})</div>
                                <input 
                                    className="form-input"
                                    type="text" 
                                    placeholder="Search by name or email..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ width: '300px' }}
                                />
                            </div>
                            <div className="filter-tabs" style={{margin: "0"}}>
                                <button className={`filter-tab ${roleFilter === "all" ? "active" : ""}`} onClick={() => setRoleFilter("all")}>All</button>
                                <button className={`filter-tab ${roleFilter === "patient" ? "active" : ""}`} onClick={() => setRoleFilter("patient")}>Patients</button>
                                <button className={`filter-tab ${roleFilter === "doctor" ? "active" : ""}`} onClick={() => setRoleFilter("doctor")}>Doctors</button>
                                <button className={`filter-tab ${roleFilter === "admin" ? "active" : ""}`} onClick={() => setRoleFilter("admin")}>Admins</button>
                            </div>
                        </div>

                        {loading ? (
                            <TableSkeleton rows={5} columns={6} />
                        ) : error ? (
                            <p style={{ padding: '1rem', color: 'red' }}>{error}</p>
                        ) : filteredUsers.length === 0 ? (
                            <p style={{ padding: '1rem' }}>No users found.</p>
                        ) : (
                            <table>
                                <thead>
                                <tr>
                                    <th>User Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="table-avatar">
                                                {user.role === 'admin' ? '🔑 ' : user.role === 'doctor' ? '👨‍⚕️ ' : '👤 '}
                                                {user.name}
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`status-badge badge-${user.role === 'doctor' ? 'completed' : user.role === 'admin' ? 'pending' : 'confirmed'}`}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td>{user.joined}</td>
                                        <td>
                                            {user.isActive ? (
                                                <span className="status-badge status-available">Active</span>
                                            ) : (
                                                <span className="status-badge status-rejected">Inactive</span>
                                            )}
                                        </td>
                                        <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                            {user.id === currentUser?.id ? (
                                                <span className="status-badge" style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>Current Account</span>
                                            ) : (
                                                <button 
                                                    className="btn-auth" 
                                                    onClick={() => confirmDelete(user)}
                                                    style={{ 
                                                        padding: '0.25rem 1rem', 
                                                        background: '#EF4444', 
                                                        width: 'fit-content', 
                                                        minWidth: 'auto', 
                                                        fontSize: '0.875rem',
                                                        borderRadius: '999px',
                                                        margin: '0 auto'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            )}
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
                title="Delete User"
                message={`Are you sure you want to permanently remove the user ${userToDelete?.name}?`}
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteModal(false)}
                confirmText={isDeleting ? "Deleting..." : "Delete User"}
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

export default AdminManageUser;