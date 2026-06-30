import React, { useEffect, useRef } from "react";
import "./components.css";

const AlertModal = ({
    isOpen,
    title,
    message,
    children,
    buttonText = "OK",
    onClose,
    maxWidth = "400px",
    showCloseIcon = false,
    customActions,
}) => {
    const modalRef = useRef(null);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === "Escape") {
                onClose();
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
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay alert-modal-overlay"
            onClick={onClose}
        >
            <div
                className="modal-content alert-modal-content"
                style={{ maxWidth }}
                onClick={(e) => e.stopPropagation()}
                ref={modalRef}
                tabIndex={-1}
            >
                <div className="alert-modal-header">
                    <h2 className="alert-modal-title">
                        {title}
                    </h2>
                    {showCloseIcon && (
                        <button onClick={onClose} className="confirm-modal-close">&times;</button>
                    )}
                </div>
                <div className="alert-modal-body">
                    {children || message}
                </div>
                <div className="alert-modal-actions">
                    {customActions}
                    <button className="btn btn-primary" onClick={onClose}>
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AlertModal;
