

const CardSkeleton = () => {
    return (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div className="skeleton skeleton-avatar"></div>
                <div style={{ flex: 1 }}>
                    <div className="skeleton skeleton-title" style={{ width: '80%', marginBottom: '8px' }}></div>
                    <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: 0 }}></div>
                </div>
            </div>
            <div style={{ marginTop: '8px' }}>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                <div className="skeleton skeleton-btn"></div>
                <div className="skeleton skeleton-btn"></div>
            </div>
        </div>
    );
};

export default CardSkeleton;
