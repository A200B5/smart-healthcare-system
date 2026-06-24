import React, { useEffect, useRef } from "react";

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
            className="modal-overlay"
            onClick={onCancel}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(4px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "20px",
            }}
        >
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
                ref={modalRef}
                tabIndex={-1}
                style={{
                    background: "var(--bg-primary, #ffffff)",
                    borderRadius: "16px",
                    padding: "24px",
                    maxWidth: "400px",
                    width: "100%",
                    boxShadow: "var(--shadow-lg, 0 20px 60px rgba(0, 0, 0, 0.3))",
                    outline: "none",
                }}
            >
                <div style={{ marginBottom: "16px" }}>
                    <h2 style={{ margin: 0, fontSize: "20px", color: "var(--text-primary)" }}>
                        {title}
                    </h2>
                </div>
                <div style={{ marginBottom: "24px", color: "var(--text-secondary)", fontSize: "15px", lineHeight: "1.5", whiteSpace: "pre-line" }}>
                    {message}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
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
