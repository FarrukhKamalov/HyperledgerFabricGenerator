import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputProps {
  type?: 'text' | 'number' | 'email' | 'password' | 'search';
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
  isDark?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  className = '',
  disabled = false,
  isDark = false,
}) => {
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-4 w-4 text-gray-400" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`${
          Icon ? 'pl-9' : 'pl-3'
        } pr-3 py-2 text-sm rounded-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
        } border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      />
    </div>
  );
};

export default Input;