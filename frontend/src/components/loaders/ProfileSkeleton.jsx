import "./loaders.css";

const ProfileSkeleton = () => {
    return (
        <div className="card skeleton-profile-wrapper">
            <div className="skeleton-profile-header">
                <div className="skeleton skeleton-avatar skeleton-profile-avatar"></div>
                <div className="skeleton skeleton-title" style={{ width: '30%', marginBottom: '8px' }}></div>
                <div className="skeleton skeleton-text" style={{ width: '20%' }}></div>
            </div>
            <div className="skeleton-profile-grid">
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
