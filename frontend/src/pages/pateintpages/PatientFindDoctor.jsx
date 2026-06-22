import PatientNavbar from "../../components/PatientNavbar.jsx";
import {Link} from "react-router-dom";
function PatientFindDoctor() {
    return (
        <>
            <PatientNavbar/>
            <div className="page" id="page-patient-doctors">
                <div className="page-content">
                    <h1 className="page-title">Find Your Doctor</h1>
                    <p className="page-subtitle">Browse our network of 8 verified specialists</p>

                    <div className="filters-bar">
                        <div className="filter-group"><label className="filter-label">Search</label><input type="text"
                                                                                                           className="filter-input"
                                                                                                           placeholder="Search by name or specialty..."/>
                        </div>
                        <div className="filter-group"><label className="filter-label">Specialty</label><select
                            className="filter-select">
                            <option>All</option>
                            <option>Cardiology</option>
                            <option>Neurology</option>
                            <option>Pediatrics</option>
                            <option>Orthopedics</option>
                            <option>Dermatology</option>
                        </select></div>
                        <div className="filter-group"><label className="filter-label">Sort By</label><select
                            className="filter-select">
                            <option>Top Rated</option>
                            <option>Most Experience</option>
                            <option>Lowest Price</option>
                        </select></div>
                        <div className="checkbox-wrapper"><input type="checkbox" id="available"/><label
                            htmlFor="available">Available Only</label></div>
                    </div>

                    <p className="showing-count">Showing <strong>6</strong> doctors</p>

                    <div className="doctors-grid">
                        <div className="doctor-card">
                            <div className="doctor-header">
                                <div className="doctor-avatar">👩‍⚕️</div>
                                <div className="doctor-info">
                                    <div className="doctor-name">Dr. Sarah Johnson</div>
                                    <div className="doctor-specialty">Cardiology</div>
                                    <div className="doctor-location">📍 Cairo Medical Center</div>
                                </div>
                                <span className="status-badge status-available">● Available</span>
                            </div>
                            <div className="doctor-stats">
                                <div className="stat-item">
                                    <div className="stat-value"><span className="star">⭐</span> 4.9</div>
                                    <div className="stat-label-sm">238 reviews</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">15y</div>
                                    <div className="stat-label-sm">Experience</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value price">$150</div>
                                    <div className="stat-label-sm">per visit</div>
                                </div>
                            </div>
                            <div className="doctor-actions">
                                <button className="btn-sm btn-sm-outline">View Profile</button>
                                <Link to="/patient/bookappointment/1" className="btn-sm btn-sm-primary">Book Now
                                </Link>
                            </div>
                        </div>

                        <div className="doctor-card">
                            <div className="doctor-header">
                                <div className="doctor-avatar">👨‍⚕️</div>
                                <div className="doctor-info">
                                    <div className="doctor-name">Dr. Ahmed Hassan</div>
                                    <div className="doctor-specialty">Neurology</div>
                                    <div className="doctor-location">📍 Nile Health Clinic</div>
                                </div>
                                <span className="status-badge status-available">● Available</span>
                            </div>
                            <div className="doctor-stats">
                                <div className="stat-item">
                                    <div className="stat-value"><span className="star">⭐</span> 4.8</div>
                                    <div className="stat-label-sm">192 reviews</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">12y</div>
                                    <div className="stat-label-sm">Experience</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value price">$180</div>
                                    <div className="stat-label-sm">per visit</div>
                                </div>
                            </div>
                            <div className="doctor-actions">
                                <button className="btn-sm btn-sm-outline">View Profile</button>
                                <Link to="/patient/bookappointment/2" className="btn-sm btn-sm-primary">Book Now
                                </Link>
                            </div>
                        </div>

                        <div className="doctor-card">
                            <div className="doctor-header">
                                <div className="doctor-avatar">👩‍⚕️</div>
                                <div className="doctor-info">
                                    <div className="doctor-name">Dr. Mona Khalil</div>
                                    <div className="doctor-specialty">Pediatrics</div>
                                    <div className="doctor-location">📍 Children's Hospital</div>
                                </div>
                                <span className="status-badge status-available">● Available</span>
                            </div>
                            <div className="doctor-stats">
                                <div className="stat-item">
                                    <div className="stat-value"><span className="star">⭐</span> 4.9</div>
                                    <div className="stat-label-sm">305 reviews</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">10y</div>
                                    <div className="stat-label-sm">Experience</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value price">$120</div>
                                    <div className="stat-label-sm">per visit</div>
                                </div>
                            </div>
                            <div className="doctor-actions">
                                <button className="btn-sm btn-sm-outline">View Profile</button>
                                <Link to="/patient/bookappointment/3" className="btn-sm btn-sm-primary">Book Now
                                </Link>
                            </div>
                        </div>

                        <div className="doctor-card">
                            <div className="doctor-header">
                                <div className="doctor-avatar">👨‍⚕️</div>
                                <div className="doctor-info">
                                    <div className="doctor-name">Dr. Omar Farouk</div>
                                    <div className="doctor-specialty">Orthopedics</div>
                                    <div className="doctor-location">📍 Sports Medicine Center</div>
                                </div>
                                <span className="status-badge status-busy">○ Busy</span>
                            </div>
                            <div className="doctor-stats">
                                <div className="stat-item">
                                    <div className="stat-value"><span className="star">⭐</span> 4.7</div>
                                    <div className="stat-label-sm">156 reviews</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">18y</div>
                                    <div className="stat-label-sm">Experience</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value price">$200</div>
                                    <div className="stat-label-sm">per visit</div>
                                </div>
                            </div>
                            <div className="doctor-actions">
                                <button className="btn-sm btn-sm-outline">View Profile</button>
                            </div>
                        </div>

                        <div className="doctor-card">
                            <div className="doctor-header">
                                <div className="doctor-avatar">👩‍⚕️</div>
                                <div className="doctor-info">
                                    <div className="doctor-name">Dr. Layla Mansour</div>
                                    <div className="doctor-specialty">Dermatology</div>
                                    <div className="doctor-location">📍 Skin Care Clinic</div>
                                </div>
                                <span className="status-badge status-available">● Available</span>
                            </div>
                            <div className="doctor-stats">
                                <div className="stat-item">
                                    <div className="stat-value"><span className="star">⭐</span> 4.8</div>
                                    <div className="stat-label-sm">274 reviews</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">8y</div>
                                    <div className="stat-label-sm">Experience</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value price">$130</div>
                                    <div className="stat-label-sm">per visit</div>
                                </div>
                            </div>
                            <div className="doctor-actions">
                                <button className="btn-sm btn-sm-outline">View Profile</button>
                                <Link to="/patient/bookappointment/4" className="btn-sm btn-sm-primary">Book Now
                                </Link>
                            </div>
                        </div>

                        <div className="doctor-card">
                            <div className="doctor-header">
                                <div className="doctor-avatar">👨‍⚕️</div>
                                <div className="doctor-info">
                                    <div className="doctor-name">Dr. Karim Nabil</div>
                                    <div className="doctor-specialty">Ophthalmology</div>
                                    <div className="doctor-location">📍 Eye Care Center</div>
                                </div>
                                <span className="status-badge status-available">● Available</span>
                            </div>
                            <div className="doctor-stats">
                                <div className="stat-item">
                                    <div className="stat-value"><span className="star">⭐</span> 4.6</div>
                                    <div className="stat-label-sm">143 reviews</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value">14y</div>
                                    <div className="stat-label-sm">Experience</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-value price">$140</div>
                                    <div className="stat-label-sm">per visit</div>
                                </div>
                            </div>
                            <div className="doctor-actions">
                                <button className="btn-sm btn-sm-outline">View Profile</button>
                                <Link to="/patient/bookappointment/5" className="btn-sm btn-sm-primary">Book Now
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PatientFindDoctor;