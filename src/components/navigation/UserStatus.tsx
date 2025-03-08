import React from 'react';

interface UserStatusProps {
  expanded: boolean;
}

const UserStatus: React.FC<UserStatusProps> = ({ expanded }) => {
  return (
    <div className="flex items-center justify-center mb-4">
      <div className="relative">
        <div className="h-2 w-2 absolute top-0 right-0 bg-green-500 rounded-full"></div>
        <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <span className="text-xs font-bold">FN</span>
        </div>
      </div>
      {expanded && (
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Network Active</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">3 peers online</p>
        </div>
      )}
    </div>
  );
};

export default UserStatus;