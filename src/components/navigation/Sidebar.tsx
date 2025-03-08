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
import ThemeToggle from '../ui/ThemeToggle';
import SidebarIcon from './SidebarIcon';
import UserStatus from './UserStatus';

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
            <SidebarIcon 
              icon={<LayoutDashboard size={20} />}
              tooltip="Network Constructor"
              active={activePage === 'constructor'}
              onClick={() => setPage('constructor')}
            />

            <SidebarIcon 
              icon={<Network size={20} />}
              tooltip="Simulation"
              active={activePage === 'simulation'}
              onClick={() => setPage('simulation')}
            />

            <SidebarIcon 
              icon={<Code size={20} />}
              tooltip="Chaincodes"
              active={activePage === 'chaincodes'}
              onClick={() => setPage('chaincodes')}
            />
            
            <SidebarIcon 
              icon={<Zap size={20} />}
              tooltip="API Generator"
              active={activePage === 'api'}
              onClick={() => setPage('api')}
            />
            
            <SidebarIcon 
              icon={<Terminal size={20} />}
              tooltip="Deployment Guide"
              active={activePage === 'deployment'}
              onClick={() => setPage('deployment')}
            />
            
            <SidebarIcon 
              icon={<BarChart4 size={20} />}
              tooltip="Network Monitoring"
              active={activePage === 'monitoring'}
              onClick={() => setPage('monitoring')}
            />

            <div className="w-full border-t border-gray-200 dark:border-gray-800 my-2"></div>

            <SidebarIcon 
              icon={<Users size={20} />}
              tooltip="Organizations"
              onClick={() => {}}
            />

            <SidebarIcon 
              icon={<Server size={20} />}
              tooltip="Orderers"
              onClick={() => {}}
            />

            <SidebarIcon 
              icon={<FileCode size={20} />}
              tooltip="Configurations"
              onClick={() => {}}
            />

            <SidebarIcon 
              icon={<Settings size={20} />}
              tooltip="Settings"
              onClick={() => {}}
            />

            <SidebarIcon 
              icon={<HelpCircle size={20} />}
              tooltip="Help"
              onClick={() => {}}
            />
          </div>
        </div>

        <div className="flex flex-col items-center p-4 border-t border-gray-200 dark:border-gray-800">
          <UserStatus expanded={expanded} />
          
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