const RevenueSummary = ({ stats, loading }) => {
    if (loading) return <p>Loading summary...</p>;
    if (!stats) return null;

    return (
        <div className="chart-card">
            <div className="chart-title">Revenue Summary</div>
            <div className="admin-dashboard-chart-list">
                <div className="admin-dashboard-stat-box">
                    <div className="admin-dashboard-stat-number gold">${stats.revenueToday?.toLocaleString() || 0}</div>
                    <div className="admin-dashboard-stat-label">Today's Revenue</div>
                </div>
                <div className="admin-dashboard-stat-box">
                    <div className="admin-dashboard-stat-number gold">${stats.revenueThisWeek?.toLocaleString() || 0}</div>
                    <div className="admin-dashboard-stat-label">Weekly Revenue</div>
                </div>
                <div className="admin-dashboard-stat-box">
                    <div className="admin-dashboard-stat-number gold">${stats.revenueThisMonth?.toLocaleString() || 0}</div>
                    <div className="admin-dashboard-stat-label">Monthly Revenue</div>
                </div>
                <div className="admin-dashboard-stat-box">
                    <div className="admin-dashboard-stat-number gold">${stats.totalRevenue?.toLocaleString() || 0}</div>
                    <div className="admin-dashboard-stat-label">Total Revenue</div>
                </div>
            </div>
        </div>
    );
};

export default RevenueSummary;
