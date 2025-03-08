import React from 'react';
import type { NetworkTemplate } from '../../types';

interface TemplateCardProps {
  template: NetworkTemplate;
  isSelected: boolean;
  onSelect: (template: NetworkTemplate) => void;
  isDark: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
  isDark,
}) => {
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover-scale ${
        isSelected
          ? isDark ? 'border-indigo-500 bg-indigo-900/30' : 'border-indigo-500 bg-indigo-50'
          : isDark ? 'border-gray-700 hover:border-indigo-500' : 'hover:border-indigo-300'
      }`}
      onClick={() => onSelect(template)}
    >
      <h3 className="text-lg font-medium">{template.name}</h3>
      <p className="text-sm opacity-70 mt-1">{template.description}</p>
      <div className="mt-4 space-y-2 text-sm opacity-80">
        <div>Channel: {template.channelName}</div>
        <div>Organizations: {template.organizations.length}</div>
        <div>Peers per Org: {template.organizations[0].peerCount}</div>
        <div>Orderers: {template.ordererCount}</div>
        <div>State DB: {template.stateDatabase}</div>
      </div>
    </div>
  );
};

export default TemplateCard;