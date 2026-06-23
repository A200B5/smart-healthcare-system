import React from "react";

const GlobalLoader = () => {
    return (
        <div className="global-loader-container">
            <div className="spinner"></div>
            <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>Loading...</p>
        </div>
    );
};

export default GlobalLoader;
