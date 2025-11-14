import React from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
    return (
        <div className="fixed top-6 right-6 z-[60] flex items-start gap-3 rounded-[--radius-lg] border shadow-lg px-4 py-3 bg-white text-[--color-text-primary] min-w-[260px]" role="status" aria-live="polite">
            <div className={`mt-1 h-2 w-2 rounded-full ${type === 'success' ? 'bg-[--color-success]' : 'bg-[--color-error]'}`}></div>
            <div className="flex-1 text-sm">{message}</div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="text-[--color-text-muted] hover:text-[--color-text-primary]"
                    aria-label="Cerrar notificación"
                >
                    ×
                </button>
            )}
        </div>
    );
};

