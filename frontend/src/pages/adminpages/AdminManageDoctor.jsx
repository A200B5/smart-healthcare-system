import AdminNavbar from "../../components/AdminNavbar.jsx";

function AdminManageDoctor() {
    return (
        <>
            <AdminNavbar/>
            <div className="page" id="page-admin-doctors">
                <div className="page-content">
                    <h1 className="page-title">Manage Doctors</h1>
                    <p className="page-subtitle">View and manage all registered doctors</p>

                    <div className="table-card">
                        <div className="table-header">
                            <div className="table-title">All Doctors (8)</div>

                        </div>
                        <table>
                            <thead>
                            <tr>
                                <th>Doctor</th>
                                <th>Specialty</th>
                                <th>Experience</th>
                                <th>Fee</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>
                                    <div className="table-avatar">👩‍⚕️ Dr. Sarah Johnson</div>
                                </td>
                                <td className="table-specialty">Cardiology</td>
                                <td>15y</td>
                                <td>$150</td>
                                <td><span className="status-badge status-available">Available</span></td>
                                <td>
                                    <button className="action-btn btn-done">Manage</button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="table-avatar">👨‍⚕️ Dr. Ahmed Hassan</div>
                                </td>
                                <td className="table-specialty">Neurology</td>
                                <td>12y</td>
                                <td>$180</td>
                                <td><span className="status-badge status-available">Available</span></td>
                                <td>
                                    <button className="action-btn btn-done">Manage</button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="table-avatar">👩‍⚕️ Dr. Mona Khalil</div>
                                </td>
                                <td className="table-specialty">Pediatrics</td>
                                <td>10y</td>
                                <td>$120</td>
                                <td><span className="status-badge status-available">Available</span></td>
                                <td>
                                    <button className="action-btn btn-done">Manage</button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="table-avatar">👨‍⚕️ Dr. Omar Farouk</div>
                                </td>
                                <td className="table-specialty">Orthopedics</td>
                                <td>18y</td>
                                <td>$200</td>
                                <td><span className="status-badge status-busy">Busy</span></td>
                                <td>
                                    <button className="action-btn btn-done">Manage</button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="table-avatar">👩‍⚕️ Dr. Layla Mansour</div>
                                </td>
                                <td className="table-specialty">Dermatology</td>
                                <td>8y</td>
                                <td>$130</td>
                                <td><span className="status-badge status-available">Available</span></td>
                                <td>
                                    <button className="action-btn btn-done">Manage</button>
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

export default AdminManageDoctor;