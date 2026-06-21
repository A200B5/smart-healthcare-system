import DoctorNavbar from "../../components/DoctorNavbar.jsx";

function DoctorDashboard() {

    return (
        <>
            <DoctorNavbar/>
            <div className="page" id="page-doctor-dashboard">
                <div className="page-content">
                    <div className="welcome-banner">
                        <div className="welcome-text">
                            <h2>Welcome back, Dr. Bakr! 👨‍⚕️</h2>
                            <p>You have new appointment requests waiting for your review</p>
                        </div>
                        <div className="welcome-icon">🩺</div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-card-dash">
                            <div className="icon">📋</div>
                            <div className="number teal">4</div>
                            <div className="label">Total Appointments</div>
                        </div>
                        <div className="stat-card-dash">
                            <div className="icon">⏳</div>
                            <div className="number yellow">1</div>
                            <div className="label">Pending</div>
                        </div>
                        <div className="stat-card-dash">
                            <div className="icon">✅</div>
                            <div className="number green">1</div>
                            <div className="label">Confirmed</div>
                        </div>
                        <div className="stat-card-dash">
                            <div className="icon">🏁</div>
                            <div className="number">1</div>
                            <div className="label">Completed</div>
                        </div>
                    </div>

                    <div className="table-card">
                        <div className="table-header">
                            <div className="table-title">Appointment Requests</div>
                            <div className="filter-tabs" style={{margin : "0"}}>
                                <button className="filter-tab active">all</button>
                                <button className="filter-tab">pending</button>
                                <button className="filter-tab">confirmed</button>
                                <button className="filter-tab">completed</button>
                                <button className="filter-tab">rejected</button>
                            </div>
                        </div>
                        <table>
                            <thead>
                            <tr>
                                <th>Patient</th>
                                <th>Specialty</th>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>
                                    <div className="table-avatar">👤 John Patient</div>
                                </td>
                                <td className="table-specialty">Cardiology</td>
                                <td>2025-04-15</td>
                                <td>10:00 AM</td>
                                <td><span className="status-badge badge-confirmed">Confirmed</span></td>
                                <td>
                                    <button className="action-btn btn-done">Mark Done</button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="table-avatar">👤 John Patient</div>
                                </td>
                                <td className="table-specialty">Neurology</td>
                                <td>2025-04-20</td>
                                <td>2:00 PM</td>
                                <td><span className="status-badge badge-pending">Pending</span></td>
                                <td>
                                    <div className="action-btns">
                                        <button className="action-btn btn-accept">Accept</button>
                                        <button className="action-btn btn-reject">Reject</button>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="table-avatar">👤 Sara Ali</div>
                                </td>
                                <td className="table-specialty">Pediatrics</td>
                                <td>2025-04-18</td>
                                <td>11:00 AM</td>
                                <td><span className="status-badge badge-completed">Completed</span></td>
                                <td className="no-action">—</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="table-avatar">👤 Mohamed Kareem</div>
                                </td>
                                <td className="table-specialty">Dermatology</td>
                                <td>2025-04-22</td>
                                <td>3:00 PM</td>
                                <td><span className="status-badge badge-rejected">Rejected</span></td>
                                <td className="no-action">—</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DoctorDashboard;