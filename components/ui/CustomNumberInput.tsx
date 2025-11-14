import React from 'react';

interface CustomNumberInputProps {
    id: string;
    label: string;
    value: number | string;
    onChange: (value: string) => void;
    disabled?: boolean;
    min?: number;
}

export const CustomNumberInput: React.FC<CustomNumberInputProps> = ({ id, label, value, onChange, disabled, min = 0 }) => {
    
    const handleValueChange = (newValue: number) => {
        if (newValue >= min) {
            onChange(String(newValue));
        }
    };
    
    const numericValue = Number(value) || 0;

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-[--color-text-secondary]">{label}</label>
            <div className="relative flex items-center mt-1">
                <button
                    type="button"
                    onClick={() => handleValueChange(numericValue - 1)}
                    disabled={disabled || numericValue <= min}
                    className="px-3 py-2 bg-gray-100 text-[--color-text-secondary] hover:bg-gray-200 rounded-l-[--radius-md] border border-r-0 border-[--color-border-strong] disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-[--color-primary]"
                    aria-label="Decrementar"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path></svg>
                </button>
                <input
                    type="number"
                    id={id}
                    value={value}
                    onChange={(e) => {
                        const val = e.target.value;
                        if (val === '' || Number(val) >= min) {
                            onChange(val);
                        }
                    }}
                    disabled={disabled}
                    className="w-full p-2 border-y border-[--color-border-strong] bg-white disabled:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-[--color-primary] focus:z-10 text-center"
                    min={min}
                />
                <button
                    type="button"
                    onClick={() => handleValueChange(numericValue + 1)}
                    disabled={disabled}
                    className="px-3 py-2 bg-gray-100 text-[--color-text-secondary] hover:bg-gray-200 rounded-r-[--radius-md] border border-l-0 border-[--color-border-strong] disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-1 focus:ring-[--color-primary]"
                    aria-label="Incrementar"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                </button>
            </div>
        </div>
    );
};
