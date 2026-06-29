import React from 'react';
import './components.css';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", isDestructive = true, isSubmitting = false }) {
    if (!isOpen) return null;

    return (
        <div className="confirm-modal-overlay">
            <div className="confirm-modal-content-wrap">
                <div className="confirm-modal-header">
                    <h3 className="confirm-modal-title">{title}</h3>
                    <button 
                        className="confirm-modal-close"
                        onClick={onCancel} 
                        disabled={isSubmitting}
                    >×</button>
                </div>
                <div className="confirm-modal-body-wrap">
                    <p className="confirm-modal-text">{message}</p>
                </div>
                <div className="confirm-modal-btns">
                    <button 
                        type="button" 
                        className="confirm-modal-btn-cancel" 
                        onClick={onCancel} 
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button 
                        type="button" 
                        className={`confirm-modal-btn-confirm ${isDestructive ? 'destructive' : 'primary'}`} 
                        onClick={onConfirm} 
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
