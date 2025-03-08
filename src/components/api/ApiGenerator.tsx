import React, { useState, useEffect } from 'react';
import { Zap, Code, Download, Play, Database, Shield, FileJson, Copy, Check, Plus, Trash2, Edit2, Save, RefreshCw } from 'lucide-react';
import Header from '../common/Header';
import Card from '../common/Card';
import Button from '../ui/Button';
import Tabs from '../ui/Tabs';
import ApiEditor from './ApiEditor';
import ApiTemplates from './ApiTemplates';
import ApiTester from './ApiTester';
import ApiSecurity from './ApiSecurity';
import ApiDocumentation from './ApiDocumentation';
import ApiExport from './ApiExport';
import { ApiEndpoint, ApiTemplate, ApiConfig, AuthType } from '../../types/api';

interface ApiGeneratorProps {
  isDark: boolean;
}

const ApiGenerator: React.FC<ApiGeneratorProps> = ({ isDark }) => {
  const [activeTab, setActiveTab] = useState('editor');
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    name: 'fabric-api',
    version: '1.0.0',
    description: 'REST API for Hyperledger Fabric Network',
    baseUrl: '/api',
    port: 3000,
    endpoints: [],
    authType: 'jwt',
    roles: ['admin', 'user'],
    language: 'javascript'
  });
  
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddEndpoint = (endpoint: ApiEndpoint) => {
    setApiConfig(prev => ({
      ...prev,
      endpoints: [...prev.endpoints, endpoint]
    }));
    showNotification(`Endpoint ${endpoint.path} added successfully`, 'success');
  };

  const handleUpdateEndpoint = (updatedEndpoint: ApiEndpoint) => {
    setApiConfig(prev => ({
      ...prev,
      endpoints: prev.endpoints.map(ep => 
        ep.id === updatedEndpoint.id ? updatedEndpoint : ep
      )
    }));
    setSelectedEndpoint(null);
    showNotification(`Endpoint ${updatedEndpoint.path} updated successfully`, 'success');
  };

  const handleDeleteEndpoint = (id: string) => {
    setApiConfig(prev => ({
      ...prev,
      endpoints: prev.endpoints.filter(ep => ep.id !== id)
    }));
    showNotification('Endpoint deleted successfully', 'success');
  };

  const handleApplyTemplate = (template: ApiTemplate) => {
    setApiConfig(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      endpoints: [...template.endpoints]
    }));
    showNotification(`Applied ${template.name} template successfully`, 'success');
    setActiveTab('editor');
  };

  const handleUpdateConfig = (updates: Partial<ApiConfig>) => {
    setApiConfig(prev => ({
      ...prev,
      ...updates
    }));
    showNotification('API configuration updated successfully', 'success');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {notification && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white z-50 transition-opacity duration-300`}>
          {notification.message}
        </div>
      )}

      <Header 
        title="REST API Generator" 
        icon={Zap}
        isDark={isDark}
      >
        <Button
          onClick={() => setActiveTab('export')}
          variant="primary"
          icon={Download}
        >
          Export API
        </Button>
        <Button
          onClick={() => setActiveTab('test')}
          variant="secondary"
          icon={Play}
        >
          Test API
        </Button>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ml-20 md:ml-auto transition-all duration-300">
        <Card isDark={isDark} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{apiConfig.name}</h1>
              <p className="text-sm opacity-70">{apiConfig.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {apiConfig.language === 'javascript' ? 'JavaScript' : 'TypeScript'}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
              }`}>
                Express.js
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
              }`}>
                {apiConfig.authType.toUpperCase()}
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'
              }`}>
                {apiConfig.endpoints.length} Endpoints
              </div>
            </div>
          </div>
        </Card>

        <Tabs
          tabs={[
            { id: 'editor', label: 'API Editor', icon: <Code className="h-4 w-4 mr-2" /> },
            { id: 'templates', label: 'Templates', icon: <FileJson className="h-4 w-4 mr-2" /> },
            { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4 mr-2" /> },
            { id: 'docs', label: 'Documentation', icon: <FileJson className="h-4 w-4 mr-2" /> },
            { id: 'test', label: 'Test API', icon: <Play className="h-4 w-4 mr-2" /> },
            { id: 'export', label: 'Export', icon: <Download className="h-4 w-4 mr-2" /> },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          isDark={isDark}
          className="mb-6"
        />

        {activeTab === 'editor' && (
          <ApiEditor 
            apiConfig={apiConfig}
            onAddEndpoint={handleAddEndpoint}
            onUpdateEndpoint={handleUpdateEndpoint}
            onDeleteEndpoint={handleDeleteEndpoint}
            onUpdateConfig={handleUpdateConfig}
            selectedEndpoint={selectedEndpoint}
            setSelectedEndpoint={setSelectedEndpoint}
            isDark={isDark}
          />
        )}
        
        {activeTab === 'templates' && (
          <ApiTemplates 
            onApplyTemplate={handleApplyTemplate}
            isDark={isDark}
          />
        )}
        
        {activeTab === 'security' && (
          <ApiSecurity 
            apiConfig={apiConfig}
            onUpdateConfig={handleUpdateConfig}
            isDark={isDark}
          />
        )}
        
        {activeTab === 'docs' && (
          <ApiDocumentation 
            apiConfig={apiConfig}
            isDark={isDark}
          />
        )}
        
        {activeTab === 'test' && (
          <ApiTester 
            apiConfig={apiConfig}
            isDark={isDark}
          />
        )}
        
        {activeTab === 'export' && (
          <ApiExport 
            apiConfig={apiConfig}
            isDark={isDark}
          />
        )}
      </main>
    </div>
  );
};

export default ApiGenerator;