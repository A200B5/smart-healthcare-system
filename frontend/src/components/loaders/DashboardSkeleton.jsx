import TableSkeleton from "./TableSkeleton.jsx";
import CardSkeleton from "./CardSkeleton.jsx";
import "./loaders.css";

const DashboardSkeleton = () => {
    return (
        <div className="page">
            <div className="page-content">
                <div className="skeleton-dashboard-grid">
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                </div>
                <TableSkeleton rows={4} columns={5} />
            </div>
        </div>
    );
};

export default DashboardSkeleton;
