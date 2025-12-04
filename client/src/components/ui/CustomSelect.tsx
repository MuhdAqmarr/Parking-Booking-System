import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string | number;
    label: string;
    subLabel?: string;
    badges?: {
        text: string;
        color: 'red' | 'orange' | 'green' | 'blue' | 'gray';
    }[];
}

interface CustomSelectProps {
    label: string;
    value: string | number;
    onChange: (value: string | number) => void;
    options: Option[];
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
    label,
    value,
    onChange,
    options,
    placeholder = 'Select...',
    required = false,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => String(opt.value) === String(value));

    const getBadgeColor = (color: string) => {
        switch (color) {
            case 'red': return 'bg-red-100 text-red-700 border border-red-200';
            case 'orange': return 'bg-orange-100 text-orange-700 border border-orange-200';
            case 'green': return 'bg-green-100 text-green-700 border border-green-200';
            case 'blue': return 'bg-blue-100 text-blue-700 border border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full p-2 border border-gray-300 rounded mt-1 text-left bg-white flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-shadow ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
            >
                <span className={`truncate ${!selectedOption ? 'text-gray-500' : 'text-gray-900'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
                    {options.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500 text-center">No options available</div>
                    ) : (
                        options.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors ${String(value) === String(opt.value) ? 'bg-cyan-50' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700 font-medium">
                                        {opt.label}
                                    </span>
                                    {opt.badges && (
                                        <div className="flex gap-1">
                                            {opt.badges.map((badge, idx) => (
                                                <span key={idx} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getBadgeColor(badge.color)}`}>
                                                    {badge.text}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {opt.subLabel && (
                                    <div className="text-xs text-gray-500 mt-0.5">
                                        {opt.subLabel}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
