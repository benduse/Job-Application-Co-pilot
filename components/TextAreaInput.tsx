
import React from 'react';

interface TextAreaInputProps {
    id: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
    rows?: number;
    disabled?: boolean;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({ id, label, value, onChange, placeholder, rows = 10, disabled = false }) => {
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
                {label}
            </label>
            <textarea
                id={id}
                rows={rows}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                className="w-full bg-slate-800 border border-slate-600 rounded-md shadow-sm p-3 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition duration-150 ease-in-out disabled:opacity-50"
            />
        </div>
    );
};

export default TextAreaInput;
