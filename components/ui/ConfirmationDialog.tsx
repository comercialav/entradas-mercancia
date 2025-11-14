
import React, { useState } from 'react';

interface ConfirmationDialogProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    requiresCheckbox?: boolean;
    checkboxLabel?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    requiresCheckbox = false,
    checkboxLabel = ""
}) => {
    const [isChecked, setIsChecked] = useState(false);
    const canConfirm = !requiresCheckbox || isChecked;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[--color-surface] rounded-[--radius-lg] shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-[--color-text-primary]">{title}</h3>
                    <p className="mt-2 text-sm text-[--color-text-secondary]">{message}</p>
                    {requiresCheckbox && (
                        <div className="mt-4 flex items-center">
                            <input
                                type="checkbox"
                                id="confirmationCheckbox"
                                checked={isChecked}
                                onChange={(e) => setIsChecked(e.target.checked)}
                                className="h-4 w-4 text-[--color-primary] focus:ring-[--color-primary] border-[--color-border-strong] rounded"
                            />
                            <label htmlFor="confirmationCheckbox" className="ml-2 block text-sm text-[--color-text-secondary]">
                                {checkboxLabel}
                            </label>
                        </div>
                    )}
                </div>
                <div className="p-4 flex justify-end gap-3 bg-gray-50 rounded-b-[--radius-lg]">
                    <button onClick={onCancel} className="px-4 py-2 text-sm font-semibold text-[--color-text-secondary] hover:bg-gray-100 rounded-[--radius-md]">
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!canConfirm}
                        className="px-4 py-2 text-sm font-semibold text-white bg-[--color-error] rounded-[--radius-md] hover:opacity-90 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};
