import React, { useState } from 'react';
import { Server, Edit2, Trash2, Check, X } from 'lucide-react';
import type { Orderer } from '../../types';
import Button from '../ui/Button';

interface OrdererCardProps {
  orderer: Orderer;
  onUpdate: (ordererId: string, updates: Partial<Orderer>) => void;
  onDelete: (ordererId: string) => void;
  isDark: boolean;
}

const OrdererCard: React.FC<OrdererCardProps> = ({
  orderer,
  onUpdate,
  onDelete,
  isDark,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(orderer.name);
  const [port, setPort] = useState(orderer.port);
  const [type, setType] = useState(orderer.type);

  const handleSave = () => {
    onUpdate(orderer.id, { name, port, type });
    setIsEditing(false);
  };

  return (
    <div 
      className={`border rounded-lg p-4 ${
        isDark ? 'border-gray-700 hover:border-indigo-500' : 'hover:border-indigo-300'
      } transition-colors duration-200 hover-scale`}
    >
      <div className="flex items-center justify-between mb-2">
        {isEditing ? (
          <div className="flex items-center space-x-2 flex-grow">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`block w-32 rounded-lg ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value))}
              className={`block w-24 rounded-lg ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'solo' | 'etcdraft')}
              className={`block w-28 rounded-lg ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            >
              <option value="solo">Solo</option>
              <option value="etcdraft">Raft</option>
            </select>
            <div className="flex space-x-1">
              <Button
                onClick={() => setIsEditing(false)}
                variant="outline"
                size="sm"
                icon={X}
              />
              <Button
                onClick={handleSave}
                variant="primary"
                size="sm"
                icon={Check}
              />
            </div>
          </div>
        ) : (
          <>
            <h3 className="text-sm font-medium">{orderer.name}</h3>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                icon={Edit2}
              >
                Edit
              </Button>
              <Button
                onClick={() => onDelete(orderer.id)}
                variant="danger"
                size="sm"
                icon={Trash2}
              >
                Delete
              </Button>
            </div>
          </>
        )}
      </div>
      <div className="text-sm opacity-70">
        <div>Domain: {orderer.domain}</div>
        <div>Port: {orderer.port}</div>
        <div>Type: {orderer.type}</div>
        <div>Batch Timeout: {orderer.batchTimeout}</div>
        <div className="mt-1">Batch Size:</div>
        <div className="ml-2">
          <div>Max Message Count: {orderer.batchSize?.maxMessageCount}</div>
          <div>Absolute Max Bytes: {orderer.batchSize?.absoluteMaxBytes}</div>
          <div>Preferred Max Bytes: {orderer.batchSize?.preferredMaxBytes}</div>
        </div>
      </div>
    </div>
  );
};

export default OrdererCard;