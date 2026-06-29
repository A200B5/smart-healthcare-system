import "./loaders.css";

const GlobalLoader = () => {
    return (
        <div className="global-loader-container">
            <div className="spinner"></div>
            <p className="global-loader-text">Loading...</p>
        </div>
    );
};

export default GlobalLoader;
