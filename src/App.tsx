import React, { useState, useEffect } from 'react';
import NetworkDashboard from './components/NetworkDashboard';
import Simulation from './components/Simulation';
import Sidebar from './components/Sidebar';
import Chaincodes from './components/Chaincodes';
import DeploymentGuide from './components/DeploymentGuide';
import NetworkMonitoring from './components/NetworkMonitoring';
import ApiGenerator from './components/api/ApiGenerator';

function App() {
  const [page, setPage] = useState<'constructor' | 'simulation' | 'chaincodes' | 'deployment' | 'monitoring' | 'api'>('constructor');
  const [isDark, setIsDark] = useState(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme class to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <Sidebar 
        activePage={page} 
        setPage={setPage} 
        isDark={isDark} 
        toggleTheme={toggleTheme} 
      />
      
      {page === 'constructor' ? (
        <NetworkDashboard isDark={isDark} />
      ) : page === 'simulation' ? (
        <Simulation isDark={isDark} />
      ) : page === 'chaincodes' ? (
        <Chaincodes isDark={isDark} />
      ) : page === 'deployment' ? (
        <DeploymentGuide isDark={isDark} />
      ) : page === 'api' ? (
        <ApiGenerator isDark={isDark} />
      ) : (
        <NetworkMonitoring isDark={isDark} />
      )}
    </div>
  );
}

export default App;