import React from 'react';
import Sidebar from '../navigation/Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  activePage: 'constructor' | 'simulation' | 'chaincodes' | 'deployment' | 'monitoring' | 'api';
  setPage: (page: 'constructor' | 'simulation' | 'chaincodes' | 'deployment' | 'monitoring' | 'api') => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activePage,
  setPage,
  isDark,
  toggleTheme
}) => {
  return (
    <div className={isDark ? 'dark' : ''}>
      <Sidebar 
        activePage={activePage} 
        setPage={setPage} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
      />
      
      <main className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;