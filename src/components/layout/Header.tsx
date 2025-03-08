import React from 'react';
import { Activity } from 'lucide-react';

interface HeaderProps {
  title: string;
  isDark: boolean;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, isDark, children }) => {
  return (
    <nav className={`sticky top-0 z-30 backdrop-blur-md ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} border-b shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center ml-16 md:ml-0">
            <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <span className="ml-2 text-xl font-semibold">
              {title}
            </span>
          </div>
          <div className="flex space-x-2">
            {children}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;