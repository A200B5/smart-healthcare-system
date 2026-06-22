import AdminNavbar from "../../components/AdminNavbar.jsx";

function AdminDashboard() {
    return (
        <>
            <AdminNavbar />
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
                            <div className="number teal">8</div>
                            <div className="label">Total Doctors</div>
                            <div className="sublabel">6 available</div>
                        </div>
                        <div className="stat-card-dash">
                            <div className="icon">📅</div>
                            <div className="number teal">4</div>
                            <div className="label">Total Appointments</div>
                            <div className="sublabel">1 pending</div>
                        </div>
                        <div className="stat-card-dash">
                            <div className="icon">✅</div>
                            <div className="number green">1</div>
                            <div className="label">Confirmed</div>
                            <div className="sublabel">appointments</div>
                        </div>
                        <div className="stat-card-dash">
                            <div className="icon">💰</div>
                            <div className="number gold">$94,500</div>
                            <div className="label">Revenue</div>
                            <div className="sublabel">this month</div>
                        </div>
                    </div>

                    <div className="charts-grid">
                        <div className="chart-card">
                            <div className="chart-title">Monthly Appointments & Patients</div>
                            <div className="chart-placeholder">📊 Bar Chart - Monthly Statistics</div>
                        </div>
                        <div className="chart-card">
                            <div className="chart-title">Appointment Status Breakdown</div>
                            <div className="chart-placeholder">🍩 Donut Chart - Status Distribution</div>
                        </div>
                        <div className="chart-card">
                            <div className="chart-title">Revenue Trend (Monthly)</div>
                            <div className="chart-placeholder">📈 Line Chart - Revenue Growth</div>
                        </div>
                        <div className="chart-card">
                            <div className="chart-title">Doctors by Specialty</div>
                            <div className="chart-placeholder">📊 Bar Chart - Specialty Distribution</div>
                        </div>
                    </div>

                    <div className="table-card">
                        <div className="table-title">Recent Appointments</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Specialty</th>
                                    <th>Date</th>
                                    <th>Time</th>
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

export default AdminDashboard;