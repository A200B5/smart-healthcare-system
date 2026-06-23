import React from 'react';

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", isDestructive = true, isSubmitting = false }) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
        }}>
            <style>
                {`
                    .confirm-modal-btn-cancel {
                        padding: 12px 28px;
                        border-radius: 999px;
                        border: 2px solid var(--border-color);
                        background: transparent;
                        color: var(--text-primary);
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    }
                    .confirm-modal-btn-cancel:hover:not(:disabled) {
                        border-color: var(--text-secondary);
                        color: var(--text-primary);
                        transform: translateY(-2px);
                    }
                    .confirm-modal-btn-confirm {
                        padding: 12px 28px;
                        border-radius: 999px;
                        border: none;
                        color: white;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                    .confirm-modal-btn-confirm:hover:not(:disabled) {
                        transform: translateY(-2px);
                    }
                    .confirm-modal-btn-confirm.destructive {
                        background: #EF4444;
                    }
                    .confirm-modal-btn-confirm.destructive:hover:not(:disabled) {
                        box-shadow: 0 8px 24px rgba(239, 68, 68, 0.35);
                    }
                    .confirm-modal-btn-confirm.primary {
                        background: var(--primary-teal);
                    }
                    .confirm-modal-btn-confirm.primary:hover:not(:disabled) {
                        box-shadow: 0 8px 24px rgba(15, 95, 95, 0.35);
                    }
                    .confirm-modal-close {
                        background: transparent;
                        border: none;
                        color: var(--text-secondary);
                        font-size: 1.5rem;
                        cursor: pointer;
                        line-height: 1;
                        border-radius: 50%;
                        transition: all 0.2s ease;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 36px;
                        height: 36px;
                    }
                    .confirm-modal-close:hover {
                        background: var(--bg-primary);
                        color: var(--text-primary);
                    }
                `}
            </style>
            <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '2rem',
                maxWidth: '450px',
                width: '90%',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 'bold' }}>{title}</h3>
                    <button 
                        className="confirm-modal-close"
                        onClick={onCancel} 
                        disabled={isSubmitting}
                    >×</button>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>{message}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
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
