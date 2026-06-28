
import TableSkeleton from "./TableSkeleton.jsx";
import CardSkeleton from "./CardSkeleton.jsx";

const DashboardSkeleton = () => {
    return (
        <div className="page">
            <div className="page-content">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
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
