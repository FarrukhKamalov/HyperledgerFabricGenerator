import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NetworkNodeProps {
  label: string;
  details?: string;
  icon?: LucideIcon;
  className?: string;
  isDark?: boolean;
}

const NetworkNode: React.FC<NetworkNodeProps> = ({
  label,
  details,
  icon: Icon,
  className = '',
  isDark = false,
}) => {
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg network-node ${className}`}>
      <div className="flex items-center">
        {Icon && <Icon className="h-4 w-4 mr-2" />}
        {!Icon && <div className="w-4 h-4 rounded-full bg-indigo-500 mr-2" />}
        <div className="ml-2">
          <div className="text-sm font-bold">{label}</div>
          {details && <div className="text-xs opacity-70">{details}</div>}
        </div>
      </div>
    </div>
  );
};

export default NetworkNode;