import './components.css';

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
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style
    };

    return (
        <button 
            type={type} 
            className={`save-button-base ${className}`} 
            style={combinedStyle} 
            disabled={disabled}
            onClick={onClick}
        >
            {isSaving ? (
                <>
                    <span className="save-spinner" />
                    Saving...
                </>
            ) : (
                text
            )}
        </button>
    );
};

export default SaveButton;
