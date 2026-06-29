import "./loaders.css";

const CardSkeleton = () => {
    return (
        <div className="card skeleton-card-wrapper">
            <div className="skeleton-card-header">
                <div className="skeleton skeleton-avatar"></div>
                <div className="skeleton-card-content">
                    <div className="skeleton skeleton-title" style={{ width: '80%', marginBottom: '8px' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: 0 }}></div>
                </div>
            </div>
            <div className="skeleton-card-body">
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
            </div>
            <div className="skeleton-card-footer">
                <div className="skeleton skeleton-btn"></div>
                <div className="skeleton skeleton-btn"></div>
            </div>
        </div>
    );
};

export default CardSkeleton;
