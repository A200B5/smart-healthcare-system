import AdminNavbar from "../../components/AdminNavbar.jsx";

function AdminManageUser() {
    return (
        <>
            <AdminNavbar/>
            <div className="page" id="page-admin-users">
                <div className="page-content">
                    <h1 className="page-title">Manage Users</h1>
                    <p className="page-subtitle">View and manage all platform users</p>

                    <div className="table-card">
                        <div className="table-header">
                            <div className="table-title">All Users (50,247)</div>
                            <div className="filter-tabs" style={{margin: "0"}}>
                                <button className="filter-tab active">All</button>
                                <button className="filter-tab">Patients</button>
                                <button className="filter-tab">Doctors</button>
                                <button className="filter-tab">Admins</button>
                            </div>
                        </div>
                        <table>
                            <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>
                                    <div className="table-avatar">👤 John Patient</div>
                                </td>
                                <td>john@email.com</td>
                                <td><span className="status-badge badge-confirmed">Patient</span></td>
                                <td>2025-01-15</td>
                                <td><span className="status-badge status-available">Active</span></td>
                                <td>
                                    <button className="action-btn btn-done">View</button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="table-avatar">👤 Sara Ali</div>
                                </td>
                                <td>sara@email.com</td>
                                <td><span className="status-badge badge-confirmed">Patient</span></td>
                                <td>2025-02-10</td>
                                <td><span className="status-badge status-available">Active</span></td>
                                <td>
                                    <button className="action-btn btn-done">View</button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="table-avatar">👨‍⚕️ Dr. Sarah Johnson</div>
                                </td>
                                <td>sarah@medicare.com</td>
                                <td><span className="status-badge badge-completed">Doctor</span></td>
                                <td>2024-11-20</td>
                                <td><span className="status-badge status-available">Active</span></td>
                                <td>
                                    <button className="action-btn btn-done">View</button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="table-avatar">🔑 Ahmed Sabry</div>
                                </td>
                                <td>ahmedsabry8818@gmail.com</td>
                                <td><span className="status-badge badge-pending">Admin</span></td>
                                <td>2024-10-01</td>
                                <td><span className="status-badge status-available">Active</span></td>
                                <td>
                                    <button className="action-btn btn-done">View</button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminManageUser;