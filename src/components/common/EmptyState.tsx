import React from 'react';
import { LucideIcon } from 'lucide-react';
import Button from '../ui/Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  isDark: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  isDark
}) => {
  return (
    <div className={`p-8 text-center rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
      <Icon className="h-12 w-12 mx-auto opacity-50 mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm opacity-70 mb-4">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          icon={Icon}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;