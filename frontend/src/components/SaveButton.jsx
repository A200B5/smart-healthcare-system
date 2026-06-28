

const SaveButton = ({ 
    isDirty, 
    isSaving, 
    onClick, 
    text = "Save Changes", 
    type = "submit",
    className = "btn btn-primary",
    style = {}
}) => {
    const disabled = !isDirty || isSaving;

    const combinedStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "var(--transition)",
        ...style
    };

    return (
        <button 
            type={type} 
            className={className} 
            style={combinedStyle} 
            disabled={disabled}
            onClick={onClick}
        >
            {isSaving ? (
                <>
                    <span 
                        style={{
                            width: "16px",
                            height: "16px",
                            border: "2px solid rgba(255,255,255,0.3)",
                            borderTop: "2px solid white",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            display: "inline-block"
                        }}
                    />
                    Saving...
                </>
            ) : (
                text
            )}
            
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </button>
    );
};

export default SaveButton;
