import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  showLabels?: boolean;
  isDark?: boolean;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  showLabels = true,
  isDark = false,
  className = '',
  variant = 'default',
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);
  
  const variantStyles = {
    default: 'bg-indigo-600',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
  };

  return (
    <div className={className}>
      {showLabels && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm">{value} of {max}</span>
        </div>
      )}
      <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div 
          className={`h-2 rounded-full ${variantStyles[variant]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;