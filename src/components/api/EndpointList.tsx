import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { ApiEndpoint } from '../../types/api';

interface EndpointListProps {
  endpoints: ApiEndpoint[];
  onEdit: (endpoint: ApiEndpoint) => void;
  onDelete: (id: string) => void;
  isDark: boolean;
}

const EndpointList: React.FC<EndpointListProps> = ({
  endpoints,
  onEdit,
  onDelete,
  isDark
}) => {
  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800';
      case 'POST':
        return isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'PUT':
        return isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800';
      case 'PATCH':
        return isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800';
      default:
        return isDark ? 'bg-gray-900/50 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  if (endpoints.length === 0) {
    return (
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
        <p className="text-sm opacity-70">No endpoints defined yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
      {endpoints.map((endpoint) => (
        <div 
          key={endpoint.id} 
          className={`p-3 rounded-lg ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'} transition-colors duration-200`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className={`px-2 py-1 rounded-md text-xs font-medium ${getMethodColor(endpoint.method)}`}>
              {endpoint.method}
            </div>
            <div className="flex space-x-1">
              <Button
                onClick={() => onEdit(endpoint)}
                variant="outline"
                size="sm"
                icon={Edit2}
              />
              <Button
                onClick={() => onDelete(endpoint.id)}
                variant="danger"
                size="sm"
                icon={Trash2}
              />
            </div>
          </div>
          <h3 className="font-medium text-sm mb-1">{endpoint.name}</h3>
          <p className="text-xs opacity-70 mb-2">{endpoint.description}</p>
          <div className="text-xs font-mono bg-black/10 dark:bg-white/10 px-2 py-1 rounded">
            {endpoint.path}
          </div>
          {endpoint.requiresAuth && (
            <div className="mt-2 flex items-center">
              <div className={`px-2 py-0.5 rounded text-xs ${
                isDark ? 'bg-indigo-900/30 text-indigo-300' : 'bg-indigo-100 text-indigo-800'
              }`}>
                Auth Required
              </div>
              {endpoint.roles.length > 0 && (
                <div className="ml-2 text-xs opacity-70">
                  Roles: {endpoint.roles.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EndpointList;