import { useState, useEffect } from "react";
import { getTopDoctors } from "../../services/adminService.js";
import TableSkeleton from "../../components/loaders/TableSkeleton.jsx";

const TopDoctorsRevenue = ({ refreshTrigger }) => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await getTopDoctors();
                if (res && res.success) {
                    setDoctors(res.data);
                }
            } catch (err) {
                console.error(err);
                setErrorMsg("Failed to load top doctors");
            } finally {
                setLoading(false);
            }
        };

        fetchDoctors();
    }, [refreshTrigger]);

    return (
        <div className="table-card admin-dashboard-section admin-transaction-section-wrap">
            <div className="table-title">Top 5 Doctors by Revenue</div>

            {loading ? (
                <TableSkeleton rows={5} columns={4} />
            ) : errorMsg ? (
                <p className="admin-dashboard-error">{errorMsg}</p>
            ) : doctors.length === 0 ? (
                <div className="admin-doctors-empty">
                    <p>No revenue data available yet.</p>
                </div>
            ) : (
                <div className="admin-transaction-table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Doctor Name</th>
                                <th>Specialty</th>
                                <th>Completed Payments</th>
                                <th>Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {doctors.map((doc, index) => (
                                <tr key={index}>
                                    <td>
                                        <div className="table-avatar">👤 {doc.doctorName}</div>
                                    </td>
                                    <td className="table-specialty">{doc.specialty}</td>
                                    <td>{doc.completedPayments}</td>
                                    <td className="admin-doctors-revenue-cell">
                                        ${doc.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TopDoctorsRevenue;
