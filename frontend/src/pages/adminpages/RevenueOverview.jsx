const RevenueOverview = ({ stats, loading }) => {
    if (loading) return <p>Loading revenue overview...</p>;
    if (!stats) return null;

    return (
        <div className="stats-grid">
            <div className="stat-card-dash">
                <div className="number gold">${stats.totalRevenue?.toLocaleString() || 0}</div>
                <div className="label">Total Revenue</div>
                <div className="sublabel">Lifetime</div>
            </div>
            <div className="stat-card-dash">
                <div className="number gold">${stats.revenueToday?.toLocaleString() || 0}</div>
                <div className="label">Revenue Today</div>
                <div className="sublabel">Today</div>
            </div>
            <div className="stat-card-dash">
                <div className="number gold">${stats.revenueThisWeek?.toLocaleString() || 0}</div>
                <div className="label">Revenue This Week</div>
                <div className="sublabel">Current Week</div>
            </div>
            <div className="stat-card-dash">
                <div className="number gold">${stats.revenueThisMonth?.toLocaleString() || 0}</div>
                <div className="label">Revenue This Month</div>
                <div className="sublabel">Current Month</div>
            </div>
            <div className="stat-card-dash">
                <div className="number gold">${stats.averagePaymentAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 0}</div>
                <div className="label">Average Payment</div>
                <div className="sublabel">Per transaction</div>
            </div>
            <div className="stat-card-dash">
                <div className="number teal">{stats.totalTransactions?.toLocaleString() || 0}</div>
                <div className="label">Total Transactions</div>
                <div className="sublabel">All time</div>
            </div>
            <div className="stat-card-dash">
                <div className="number green">{stats.successfulPayments?.toLocaleString() || 0}</div>
                <div className="label">Successful Payments</div>
                <div className="sublabel">Completed</div>
            </div>
            <div className="stat-card-dash">
                <div className="number" style={{ color: "var(--rejected)" }}>{stats.refundedPayments?.toLocaleString() || 0}</div>
                <div className="label">Refunded Payments</div>
                <div className="sublabel">Successfully Refunded</div>
            </div>
        </div>
    );
};

export default RevenueOverview;
