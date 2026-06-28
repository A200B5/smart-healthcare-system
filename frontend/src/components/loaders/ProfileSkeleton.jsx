

const ProfileSkeleton = () => {
    return (
        <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
                <div className="skeleton skeleton-avatar" style={{ width: '120px', height: '120px', marginBottom: '16px' }}></div>
                <div className="skeleton skeleton-title" style={{ width: '30%', marginBottom: '8px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '20%' }}></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                <div>
                    <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '8px' }}></div>
                    <div className="skeleton skeleton-title" style={{ width: '80%' }}></div>
                </div>
                <div>
                    <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '8px' }}></div>
                    <div className="skeleton skeleton-title" style={{ width: '80%' }}></div>
                </div>
                <div>
                    <div className="skeleton skeleton-text" style={{ width: '40%', marginBottom: '8px' }}></div>
                    <div className="skeleton skeleton-title" style={{ width: '80%' }}></div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSkeleton;
