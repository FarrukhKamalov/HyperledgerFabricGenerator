import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  isDark?: boolean;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  isDark = false,
  className = '',
}) => {
  return (
    <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} ${className}`}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${activeTab === tab.id
                ? `${isDark ? 'border-indigo-500 text-indigo-400' : 'border-indigo-500 text-indigo-600'}`
                : `${isDark ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`
              }
            `}
          >
            <div className="flex items-center">
              {tab.icon}
              <span className={tab.icon ? 'ml-2' : ''}>{tab.label}</span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Tabs;