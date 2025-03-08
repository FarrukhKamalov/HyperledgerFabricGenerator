import React from 'react';

interface SidebarIconProps {
  icon: React.ReactNode;
  tooltip: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({
  icon,
  tooltip,
  active = false,
  onClick
}) => {
  return (
    <button 
      className={`sidebar-icon ${active ? 'bg-indigo-600 text-white' : ''}`}
      onClick={onClick}
    >
      {icon}
      <span className="sidebar-tooltip">{tooltip}</span>
    </button>
  );
};

export default SidebarIcon;