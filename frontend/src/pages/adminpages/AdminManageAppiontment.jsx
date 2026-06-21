import AdminNavbar from "../../components/AdminNavbar.jsx";

function AdminManageAppiontment() {
    return (
        <>
            <AdminNavbar/>
            <div className="page" id="page-admin-appointments">
                <div className="page-content">
                    <h1 className="page-title">All Appointments</h1>
                    <p className="page-subtitle">Monitor and manage all appointments across the platform</p>

                    <div className="filter-tabs">
                        <button className="filter-tab active">All (4)</button>
                        <button className="filter-tab">Pending (1)</button>
                        <button className="filter-tab">Confirmed (1)</button>
                        <button className="filter-tab">Completed (1)</button>
                        <button className="filter-tab">Rejected (1)</button>
                    </div>

                    <div className="table-card">
                        <div className="table-title">Appointments List</div>
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
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>
                                    <div className="table-avatar">👤 John Patient</div>
                                </td>
                                <td>Dr. Sarah Johnson</td>
                                <td className="table-specialty">Cardiology</td>
                                <td>2025-04-15</td>
                                <td>10:00 AM</td>
                                <td>$150</td>
                                <td><span className="status-badge badge-confirmed">Confirmed</span></td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="table-avatar">👤 John Patient</div>
                                </td>
                                <td>Dr. Ahmed Hassan</td>
                                <td className="table-specialty">Neurology</td>
                                <td>2025-04-20</td>
                                <td>2:00 PM</td>
                                <td>$180</td>
                                <td><span className="status-badge badge-pending">Pending</span></td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="table-avatar">👤 Sara Ali</div>
                                </td>
                                <td>Dr. Mona Khalil</td>
                                <td className="table-specialty">Pediatrics</td>
                                <td>2025-04-18</td>
                                <td>11:00 AM</td>
                                <td>$120</td>
                                <td><span className="status-badge badge-completed">Completed</span></td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="table-avatar">👤 Mohamed Kareem</div>
                                </td>
                                <td>Dr. Layla Mansour</td>
                                <td className="table-specialty">Dermatology</td>
                                <td>2025-04-22</td>
                                <td>3:00 PM</td>
                                <td>$130</td>
                                <td><span className="status-badge badge-rejected">Rejected</span></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AdminManageAppiontment