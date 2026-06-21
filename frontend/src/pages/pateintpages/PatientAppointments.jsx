import PatientNavbar from "../../components/PatientNavbar.jsx";

function PatientAppointments() {
    return (
        <>
            <PatientNavbar/>
            <div className="page" id="page-patient-appointments">
                <div className="page-content">
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">My Appointments</h1>
                            <p className="page-subtitle">Track and manage all your medical appointments</p>
                        </div>
                        <button className="btn btn-primary">+ Book New
                            Appointment
                        </button>
                    </div>

                    <div className="filter-tabs">
                        <button className="filter-tab active">All (4)</button>
                        <button className="filter-tab">pending (1)</button>
                        <button className="filter-tab">confirmed (1)</button>
                        <button className="filter-tab">completed (1)</button>
                        <button className="filter-tab">rejected (1)</button>
                    </div>

                    <div className="appointment-card confirmed">
                        <div className="appt-doctor">
                            <div className="appt-avatar">👩‍⚕️</div>
                            <div>
                                <div className="appt-name">Dr. Sarah Johnson</div>
                                <div className="appt-specialty">Cardiology</div>
                            </div>
                        </div>
                        <div className="appt-details">
                            <div className="appt-detail-item">
                                <div className="appt-detail-label">Date</div>
                                <div className="appt-detail-value">📅 2025-04-15</div>
                            </div>
                            <div className="appt-detail-item">
                                <div className="appt-detail-label">Time</div>
                                <div className="appt-detail-value">🕐 10:00 AM</div>
                            </div>
                            <span className="status-badge badge-confirmed">Confirmed</span>
                        </div>
                    </div>

                    <div className="appointment-card pending">
                        <div className="appt-doctor">
                            <div className="appt-avatar">👨‍⚕️</div>
                            <div>
                                <div className="appt-name">Dr. Ahmed Hassan</div>
                                <div className="appt-specialty">Neurology</div>
                            </div>
                        </div>
                        <div className="appt-details">
                            <div className="appt-detail-item">
                                <div className="appt-detail-label">Date</div>
                                <div className="appt-detail-value">📅 2025-04-20</div>
                            </div>
                            <div className="appt-detail-item">
                                <div className="appt-detail-label">Time</div>
                                <div className="appt-detail-value">🕐 2:00 PM</div>
                            </div>
                            <span className="status-badge badge-pending">Pending</span>
                        </div>
                    </div>

                    <div className="appointment-card completed">
                        <div className="appt-doctor">
                            <div className="appt-avatar">👩‍⚕️</div>
                            <div>
                                <div className="appt-name">Dr. Mona Khalil</div>
                                <div className="appt-specialty">Pediatrics</div>
                            </div>
                        </div>
                        <div className="appt-details">
                            <div className="appt-detail-item">
                                <div className="appt-detail-label">Date</div>
                                <div className="appt-detail-value">📅 2025-04-18</div>
                            </div>
                            <div className="appt-detail-item">
                                <div className="appt-detail-label">Time</div>
                                <div className="appt-detail-value">🕐 11:00 AM</div>
                            </div>
                            <span className="status-badge badge-completed">Completed</span>
                        </div>
                    </div>

                    <div className="appointment-card rejected">
                        <div className="appt-doctor">
                            <div className="appt-avatar">👩‍⚕️</div>
                            <div>
                                <div className="appt-name">Dr. Layla Mansour</div>
                                <div className="appt-specialty">Dermatology</div>
                            </div>
                        </div>
                        <div className="appt-details">
                            <div className="appt-detail-item">
                                <div className="appt-detail-label">Date</div>
                                <div className="appt-detail-value">📅 2025-04-22</div>
                            </div>
                            <div className="appt-detail-item">
                                <div className="appt-detail-label">Time</div>
                                <div className="appt-detail-value">🕐 3:00 PM</div>
                            </div>
                            <span className="status-badge badge-rejected">Rejected</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PatientAppointments;