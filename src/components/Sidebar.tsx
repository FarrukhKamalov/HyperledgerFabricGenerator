import React, { useState } from 'react';
import { 
  Activity, 
  Users, 
  Server, 
  Settings, 
  ChevronRight, 
  ChevronLeft,
  LayoutDashboard,
  Network,
  FileCode,
  HelpCircle,
  Menu,
  X,
  Code,
  Terminal,
  BarChart4,
  Zap
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  activePage: 'constructor' | 'simulation' | 'chaincodes' | 'deployment' | 'monitoring' | 'api';
  setPage: (page: 'constructor' | 'simulation' | 'chaincodes' | 'deployment' | 'monitoring' | 'api') => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setPage, isDark, toggleTheme }) => {
  const [expanded, setExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const toggleMobileSidebar = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 rounded-lg bg-indigo-600 text-white shadow-lg"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-gray-900 shadow-xl transition-all duration-300 ease-in-out
          ${expanded ? 'sidebar-expanded' : 'sidebar-collapsed'} 
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-800">
          <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          {expanded && (
            <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
              Fabric Net
            </span>
          )}
        </div>

        <div className="flex flex-col items-center flex-1 overflow-y-auto py-4">
          <div className="flex flex-col items-center space-y-4 w-full">
            <button 
              className={`sidebar-icon ${activePage === 'constructor' ? 'bg-indigo-600 text-white' : ''}`}
              onClick={() => setPage('constructor')}
            >
              <LayoutDashboard size={20} />
              <span className="sidebar-tooltip">Network Constructor</span>
            </button>

            <button 
              className={`sidebar-icon ${activePage === 'simulation' ? 'bg-indigo-600 text-white' : ''}`}
              onClick={() => setPage('simulation')}
            >
              <Network size={20} />
              <span className="sidebar-tooltip">Simulation</span>
            </button>

            <button 
              className={`sidebar-icon ${activePage === 'chaincodes' ? 'bg-indigo-600 text-white' : ''}`}
              onClick={() => setPage('chaincodes')}
            >
              <Code size={20} />
              <span className="sidebar-tooltip">Chaincodes</span>
            </button>
            
            <button 
              className={`sidebar-icon ${activePage === 'api' ? 'bg-indigo-600 text-white' : ''}`}
              onClick={() => setPage('api')}
            >
              <Zap size={20} />
              <span className="sidebar-tooltip">API Generator</span>
            </button>
            
            <button 
              className={`sidebar-icon ${activePage === 'deployment' ? 'bg-indigo-600 text-white' : ''}`}
              onClick={() => setPage('deployment')}
            >
              <Terminal size={20} />
              <span className="sidebar-tooltip">Deployment Guide</span>
            </button>
            
            <button 
              className={`sidebar-icon ${activePage === 'monitoring' ? 'bg-indigo-600 text-white' : ''}`}
              onClick={() => setPage('monitoring')}
            >
              <BarChart4 size={20} />
              <span className="sidebar-tooltip">Network Monitoring</span>
            </button>

            <div className="w-full border-t border-gray-200 dark:border-gray-800 my-2"></div>

            <button className="sidebar-icon">
              <Users size={20} />
              <span className="sidebar-tooltip">Organizations</span>
            </button>

            <button className="sidebar-icon">
              <Server size={20} />
              <span className="sidebar-tooltip">Orderers</span>
            </button>

            <button className="sidebar-icon">
              <FileCode size={20} />
              <span className="sidebar-tooltip">Configurations</span>
            </button>

            <button className="sidebar-icon">
              <Settings size={20} />
              <span className="sidebar-tooltip">Settings</span>
            </button>

            <button className="sidebar-icon">
              <HelpCircle size={20} />
              <span className="sidebar-tooltip">Help</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center p-4 border-t border-gray-200 dark:border-gray-800">
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

          <div className="flex items-center justify-between w-full">
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;