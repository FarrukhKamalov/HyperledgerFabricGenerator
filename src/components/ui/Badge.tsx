import React from 'react';
import { LucideIcon } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
  icon?: LucideIcon;
  className?: string;
  isDark?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  icon: Icon,
  className = '',
  isDark = false,
}) => {
  const variantStyles = {
    success: isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
    warning: isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
    error: isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800',
    info: isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {children}
    </span>
  );
};

export default Badge;