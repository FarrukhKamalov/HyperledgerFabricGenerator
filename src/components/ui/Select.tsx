import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
  isDark?: boolean;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  icon: Icon,
  className = '',
  disabled = false,
  isDark = false,
  placeholder,
}) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${
          Icon ? 'pl-9' : 'pl-3'
        } pr-8 py-2 text-sm rounded-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white border-gray-300 text-gray-900'
        } border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;