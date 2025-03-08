import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, Code, RefreshCw, Database } from 'lucide-react';
import Card from '../common/Card';
import Button from '../ui/Button';
import EndpointForm from './EndpointForm';
import EndpointList from './EndpointList';
import { ApiConfig, ApiEndpoint } from '../../types/api';

interface ApiEditorProps {
  apiConfig: ApiConfig;
  onAddEndpoint: (endpoint: ApiEndpoint) => void;
  onUpdateEndpoint: (endpoint: ApiEndpoint) => void;
  onDeleteEndpoint: (id: string) => void;
  onUpdateConfig: (updates: Partial<ApiConfig>) => void;
  selectedEndpoint: ApiEndpoint | null;
  setSelectedEndpoint: (endpoint: ApiEndpoint | null) => void;
  isDark: boolean;
}

const ApiEditor: React.FC<ApiEditorProps> = ({
  apiConfig,
  onAddEndpoint,
  onUpdateEndpoint,
  onDeleteEndpoint,
  onUpdateConfig,
  selectedEndpoint,
  setSelectedEndpoint,
  isDark
}) => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleAddClick = () => {
    setSelectedEndpoint(null);
    setIsEditing(false);
    setShowForm(true);
  };

  const handleEditClick = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleFormSubmit = (endpoint: ApiEndpoint) => {
    if (isEditing && selectedEndpoint) {
      onUpdateEndpoint(endpoint);
    } else {
      onAddEndpoint(endpoint);
    }
    setShowForm(false);
    setIsEditing(false);
    setSelectedEndpoint(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setSelectedEndpoint(null);
  };

  const handleSettingsSubmit = (formData: Partial<ApiConfig>) => {
    onUpdateConfig(formData);
    setShowSettings(false);
  };

  const handleGenerateFromChaincode = () => {
    // This would be implemented to parse chaincode and generate endpoints
    const mockEndpoints: ApiEndpoint[] = [
      {
        id: crypto.randomUUID(),
        name: 'Create Asset',
        description: 'Create a new asset in the ledger',
        path: '/assets',
        method: 'POST',
        chaincode: 'asset-transfer',
        function: 'CreateAsset',
        parameters: [
          { name: 'id', type: 'string', required: true, in: 'body' },
          { name: 'color', type: 'string', required: true, in: 'body' },
          { name: 'size', type: 'number', required: true, in: 'body' },
          { name: 'owner', type: 'string', required: true, in: 'body' },
          { name: 'value', type: 'number', required: true, in: 'body' }
        ],
        responses: {
          '200': { description: 'Asset created successfully' },
          '400': { description: 'Invalid input' },
          '500': { description: 'Internal server error' }
        },
        requiresAuth: true,
        roles: ['admin']
      },
      {
        id: crypto.randomUUID(),
        name: 'Get Asset',
        description: 'Retrieve an asset by ID',
        path: '/assets/:id',
        method: 'GET',
        chaincode: 'asset-transfer',
        function: 'ReadAsset',
        parameters: [
          { name: 'id', type: 'string', required: true, in: 'path' }
        ],
        responses: {
          '200': { description: 'Asset retrieved successfully' },
          '404': { description: 'Asset not found' },
          '500': { description: 'Internal server error' }
        },
        requiresAuth: true,
        roles: ['admin', 'user']
      },
      {
        id: crypto.randomUUID(),
        name: 'Update Asset',
        description: 'Update an existing asset',
        path: '/assets/:id',
        method: 'PUT',
        chaincode: 'asset-transfer',
        function: 'UpdateAsset',
        parameters: [
          { name: 'id', type: 'string', required: true, in: 'path' },
          { name: 'color', type: 'string', required: false, in: 'body' },
          { name: 'size', type: 'number', required: false, in: 'body' },
          { name: 'owner', type: 'string', required: false, in: 'body' },
          { name: 'value', type: 'number', required: false, in: 'body' }
        ],
        responses: {
          '200': { description: 'Asset updated successfully' },
          '404': { description: 'Asset not found' },
          '500': { description: 'Internal server error' }
        },
        requiresAuth: true,
        roles: ['admin']
      }
    ];

    mockEndpoints.forEach(endpoint => {
      onAddEndpoint(endpoint);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card isDark={isDark} className="h-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">API Endpoints</h2>
            <div className="flex space-x-2">
              <Button
                onClick={handleAddClick}
                variant="primary"
                size="sm"
                icon={Plus}
              >
                Add Endpoint
              </Button>
            </div>
          </div>

          <div className="mb-4">
            <Button
              onClick={handleGenerateFromChaincode}
              variant="secondary"
              size="sm"
              icon={Code}
              className="w-full"
            >
              Generate from Chaincode
            </Button>
          </div>

          <EndpointList
            endpoints={apiConfig.endpoints}
            onEdit={handleEditClick}
            onDelete={onDeleteEndpoint}
            isDark={isDark}
          />
        </Card>
      </div>

      <div className="lg:col-span-2">
        {showForm ? (
          <Card isDark={isDark}>
            <h2 className="text-lg font-medium mb-4">
              {isEditing ? 'Edit Endpoint' : 'Add New Endpoint'}
            </h2>
            <EndpointForm
              initialValues={selectedEndpoint || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isDark={isDark}
            />
          </Card>
        ) : (
          <Card isDark={isDark}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">API Configuration</h2>
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                size="sm"
                icon={showSettings ? Save : Edit2}
              >
                {showSettings ? 'Save Settings' : 'Edit Settings'}
              </Button>
            </div>

            {showSettings ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">API Name</label>
                    <input
                      type="text"
                      value={apiConfig.name}
                      onChange={(e) => onUpdateConfig({ name: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Version</label>
                    <input
                      type="text"
                      value={apiConfig.version}
                      onChange={(e) => onUpdateConfig({ version: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={apiConfig.description}
                    onChange={(e) => onUpdateConfig({ description: e.target.value })}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                    } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Base URL</label>
                    <input
                      type="text"
                      value={apiConfig.baseUrl}
                      onChange={(e) => onUpdateConfig({ baseUrl: e.target.value })}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Port</label>
                    <input
                      type="number"
                      value={apiConfig.port}
                      onChange={(e) => onUpdateConfig({ port: parseInt(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Language</label>
                    <select
                      value={apiConfig.language}
                      onChange={(e) => onUpdateConfig({ language: e.target.value as 'javascript' | 'typescript' })}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Authentication</label>
                    <select
                      value={apiConfig.authType}
                      onChange={(e) => onUpdateConfig({ authType: e.target.value as 'jwt' | 'apikey' | 'none' })}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                      <option value="jwt">JWT</option>
                      <option value="apikey">API Key</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => setShowSettings(false)}
                    variant="outline"
                    size="sm"
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleSettingsSubmit(apiConfig)}
                    variant="primary"
                    size="sm"
                    icon={Save}
                  >
                    Save Settings
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-2">API Details</h3>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="font-medium">Name:</div>
                        <div className="col-span-2">{apiConfig.name}</div>
                        
                        <div className="font-medium">Version:</div>
                        <div className="col-span-2">{apiConfig.version}</div>
                        
                        <div className="font-medium">Base URL:</div>
                        <div className="col-span-2">{apiConfig.baseUrl}</div>
                        
                        <div className="font-medium">Port:</div>
                        <div className="col-span-2">{apiConfig.port}</div>
                        
                        <div className="font-medium">Language:</div>
                        <div className="col-span-2">{apiConfig.language === 'javascript' ? 'JavaScript' : 'TypeScript'}</div>
                        
                        <div className="font-medium">Auth:</div>
                        <div className="col-span-2">{apiConfig.authType.toUpperCase()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Description</h3>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} h-full`}>
                      <p className="text-sm">{apiConfig.description}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">API Structure</h3>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="text-sm space-y-2">
                      <div className="flex items-center">
                        <Database className="h-4 w-4 mr-2" />
                        <span className="font-medium">Endpoints:</span>
                        <span className="ml-2">{apiConfig.endpoints.length} total</span>
                      </div>
                      <div>
                        <div className="ml-6 grid grid-cols-4 gap-2">
                          <div className="font-medium">GET:</div>
                          <div className="col-span-3">{apiConfig.endpoints.filter(e => e.method === 'GET').length}</div>
                          
                          <div className="font-medium">POST:</div>
                          <div className="col-span-3">{apiConfig.endpoints.filter(e => e.method === 'POST').length}</div>
                          
                          <div className="font-medium">PUT:</div>
                          <div className="col-span-3">{apiConfig.endpoints.filter(e => e.method === 'PUT').length}</div>
                          
                          <div className="font-medium">DELETE:</div>
                          <div className="col-span-3">{apiConfig.endpoints.filter(e => e.method === 'DELETE').length}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center">
                  <Button
                    onClick={handleAddClick}
                    variant="primary"
                    icon={Plus}
                  >
                    Add New Endpoint
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApiEditor;