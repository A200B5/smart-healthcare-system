import { useEffect, useRef } from "react";
import "./components.css";

const ConfirmationModal = ({
    isOpen,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
    isDanger = true,
}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                onCancel();
            }
        };

        if (isOpen) {
            window.addEventListener("keydown", handleEsc);
            // Lock background scroll
            document.body.style.overflow = "hidden";
            // Focus modal for accessibility
            if (modalRef.current) {
                modalRef.current.focus();
            }
        }

        return () => {
            window.removeEventListener("keydown", handleEsc);
            // Restore background scroll
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay alert-modal-overlay"
            onClick={onCancel}
        >
            <div
                className="modal-content alert-modal-content"
                onClick={(e) => e.stopPropagation()}
                ref={modalRef}
                tabIndex={-1}
            >
                <div className="alert-modal-header">
                    <h2 className="alert-modal-title">
                        {title}
                    </h2>
                </div>
                <div className="alert-modal-body">
                    {message}
                </div>
                <div className="confirm-modal-actions">
                    <button className="btn btn-outline" onClick={onCancel}>
                        {cancelText}
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={onConfirm}
                        style={
                            isDanger
                                ? { background: "var(--rejected, #ef4444)", borderColor: "var(--rejected, #ef4444)", color: "#ffffff" }
                                : {}
                        }
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
