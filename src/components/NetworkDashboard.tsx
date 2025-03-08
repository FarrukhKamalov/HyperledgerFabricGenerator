import React, { useState, useEffect } from 'react';
import { Activity, Users, Server, Plus, Download, Settings, Trash2, Edit2, X, Check, FileJson, FileText, Archive, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { NetworkConfig, Organization, Orderer, YAMLConfig, NetworkTemplate } from '../types';
import { validateNetworkConfig, ValidationResult } from '../utils/networkValidator';
import { generateNetworkDocumentation } from '../utils/documentationGenerator';
import { NETWORK_TEMPLATES } from '../types';
import NetworkVisualizer from './NetworkVisualizer';
import NetworkConfigExport from './NetworkConfigExport';
import Button from './ui/Button';

interface NetworkDashboardProps {
  isDark: boolean;
}

export default function NetworkDashboard({ isDark }: NetworkDashboardProps) {
  const [config, setConfig] = useState<NetworkConfig>({
    organizations: [],
    orderers: [],
    channelName: '',
    consortium: 'SampleConsortium',
    networkVersion: '2.0',
    stateDatabase: 'CouchDB'
  });

  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [editingPeer, setEditingPeer] = useState<{orgId: string, peerId: string} | null>(null);
  const [editingOrderer, setEditingOrderer] = useState<string | null>(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [yamlPreview, setYamlPreview] = useState<YAMLConfig | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NetworkTemplate | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [showConfigExport, setShowConfigExport] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleNodeClick = (nodeId: string, type: 'org' | 'peer' | 'orderer') => {
    switch (type) {
      case 'org':
        setEditingOrg(nodeId);
        break;
      case 'orderer':
        setEditingOrderer(nodeId);
        break;
      case 'peer':
        const org = config.organizations.find(o => o.peers.some(p => p.id === nodeId));
        if (org) {
          setEditingPeer({ orgId: org.id, peerId: nodeId });
        }
        break;
    }
  };

  const checkConfiguration = () => {
    const results = validateNetworkConfig(config);
    setValidationResults(results);
    setShowValidation(true);
    
    const hasErrors = results.some(result => result.status === 'error');
    if (hasErrors) {
      showNotification('Configuration has critical issues that need to be addressed', 'error');
    } else if (results.length > 0) {
      showNotification('Configuration has warnings that should be reviewed', 'warning');
    } else {
      showNotification('Configuration looks good!', 'success');
    }
  };

  const applyTemplate = (template: NetworkTemplate) => {
    setSelectedTemplate(template);
    
    const newOrgs: Organization[] = template.organizations.map(org => ({
      id: crypto.randomUUID(),
      name: org.name,
      domain: `${org.name.toLowerCase().replace(/\s+/g, '')}.example.com`,
      mspID: `${org.name.replace(/\s+/g, '')}MSP`,
      peers: Array.from({ length: org.peerCount }, (_, i) => ({
        id: crypto.randomUUID(),
        name: `peer${i}`,
        port: 7051 + i,
        status: 'pending',
        couchDBPort: 5984 + i,
        chaincodePort: 7052 + i
      })),
      type: org.type,
      country: 'US',
      state: 'California',
      locality: 'San Francisco'
    }));

    const newOrderers: Orderer[] = Array.from({ length: template.ordererCount }, (_, i) => ({
      id: crypto.randomUUID(),
      name: `orderer${i}`,
      domain: 'orderer.example.com',
      port: 7050 + i,
      status: 'pending',
      type: 'etcdraft',
      batchTimeout: '2s',
      batchSize: {
        maxMessageCount: 500,
        absoluteMaxBytes: 10485760,
        preferredMaxBytes: 2097152
      }
    }));

    setConfig({
      organizations: newOrgs,
      orderers: newOrderers,
      channelName: template.channelName,
      consortium: 'SampleConsortium',
      networkVersion: '2.0',
      template: template,
      stateDatabase: template.stateDatabase
    });

    showNotification(`Applied ${template.name} template successfully`, 'success');
  };

  const addOrganization = () => {
    if (!newOrgName.trim()) {
      showNotification('Organization name is required', 'error');
      return;
    }

    const newOrg: Organization = {
      id: crypto.randomUUID(),
      name: newOrgName.trim(),
      domain: `${newOrgName.toLowerCase().replace(/\s+/g, '')}.example.com`,
      mspID: `${newOrgName.replace(/\s+/g, '')}MSP`,
      peers: [],
      country: 'US',
      state: 'California',
      locality: 'San Francisco'
    };

    setConfig(prev => ({
      ...prev,
      organizations: [...prev.organizations, newOrg]
    }));
    setNewOrgName('');
    showNotification(`Organization ${newOrg.name} added successfully`, 'success');
  };

  const updateOrganization = (orgId: string, updates: Partial<Organization>) => {
    setConfig(prev => ({
      ...prev,
      organizations: prev.organizations.map(org =>
        org.id === orgId ? { ...org, ...updates } : org
      )
    }));
    showNotification('Organization updated successfully', 'success');
  };

  const deleteOrganization = (orgId: string) => {
    setConfig(prev => ({
      ...prev,
      organizations: prev.organizations.filter(org => org.id !== orgId)
    }));
    showNotification('Organization deleted successfully', 'success');
  };

  const addPeer = (orgId: string) => {
    const org = config.organizations.find(o => o.id === orgId);
    if (!org) return;

    const newPeer = {
      id: crypto.randomUUID(),
      name: `peer${org.peers.length}`,
      port: 7051 + org.peers.length,
      status: 'pending' as const,
      couchDBPort: 5984 + org.peers.length,
      chaincodePort: 7052 + org.peers.length
    };

    setConfig(prev => ({
      ...prev,
      organizations: prev.organizations.map(o =>
        o.id === orgId
          ? { ...o, peers: [...o.peers, newPeer] }
          : o
      )
    }));
    showNotification(`Peer ${newPeer.name} added to ${org.name}`, 'success');
  };

  const updatePeer = (orgId: string, peerId: string, updates: Partial<Peer>) => {
    setConfig(prev => ({
      ...prev,
      organizations: prev.organizations.map(org =>
        org.id === orgId
          ? {
              ...org,
              peers: org.peers.map(peer =>
                peer.id === peerId ? { ...peer, ...updates } : peer
              )
            }
          : org
      )
    }));
    setEditingPeer(null);
    showNotification('Peer updated successfully', 'success');
  };

  const deletePeer = (orgId: string, peerId: string) => {
    setConfig(prev => ({
      ...prev,
      organizations: prev.organizations.map(org =>
        org.id === orgId
          ? { ...org, peers: org.peers.filter(peer => peer.id !== peerId) }
          : org
      )
    }));
    showNotification('Peer deleted successfully', 'success');
  };

  const addOrderer = () => {
    const newOrderer: Orderer = {
      id: crypto.randomUUID(),
      name: `orderer${config.orderers.length}`,
      domain: 'orderer.example.com',
      port: 7050 + config.orderers.length,
      status: 'pending',
      type: 'etcdraft',
      batchTimeout: '2s',
      batchSize: {
        maxMessageCount: 500,
        absoluteMaxBytes: 10485760,
        preferredMaxBytes: 2097152
      }
    };

    setConfig(prev => ({
      ...prev,
      orderers: [...prev.orderers, newOrderer]
    }));
    showNotification(`Orderer ${newOrderer.name} added successfully`, 'success');
  };

  const updateOrderer = (ordererId: string, updates: Partial<Orderer>) => {
    setConfig(prev => ({
      ...prev,
      orderers: prev.orderers.map(orderer =>
        orderer.id === ordererId ? { ...orderer, ...updates } : orderer
      )
    }));
    setEditingOrderer(null);
    showNotification('Orderer updated successfully', 'success');
  };

  const deleteOrderer = (ordererId: string) => {
    setConfig(prev => ({
      ...prev,
      orderers: prev.orderers.filter(orderer => orderer.id !== ordererId)
    }));
    showNotification('Orderer deleted successfully', 'success');
  };

  const generateConfigs = () => {
    if (config.organizations.length === 0) {
      showNotification('Add at least one organization before generating configs', 'error');
      return;
    }
    
    // Check configuration first
    const results = validateNetworkConfig(config);
    const hasErrors = results.some(result => result.status === 'error');
    
    if (hasErrors) {
      setValidationResults(results);
      setShowValidation(true);
      showNotification('Please fix configuration errors before generating configs', 'error');
      return;
    }
    
    // Generate configs and show export view
    setShowConfigExport(true);
    showNotification('Configuration files generated successfully', 'success');
  };

  const downloadJSON = () => {
    const content = JSON.stringify(config, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'network-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Network configuration downloaded as JSON', 'success');
  };

  const downloadAll = async () => {
    // Check configuration first
    const results = validateNetworkConfig(config);
    const hasErrors = results.some(result => result.status === 'error');
    
    if (hasErrors) {
      setValidationResults(results);
      setShowValidation(true);
      showNotification('Please fix configuration errors before downloading', 'error');
      return;
    }
    
    // Show export view
    setShowConfigExport(true);
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

      <nav className={`sticky top-0 z-30 backdrop-blur-md ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center ml-16 md:ml-0">
              <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 text-xl font-semibold">
                Fabric Network Constructor
              </span>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={checkConfiguration}
                variant="primary"
                icon={AlertTriangle}
              >
                Check Configuration
              </Button>
              <Button
                onClick={generateConfigs}
                variant="primary"
                icon={Settings}
              >
                Generate Configs
              </Button>
              <Button
                onClick={downloadJSON}
                variant="secondary"
                icon={FileJson}
              >
                Download JSON
              </Button>
              <Button
                onClick={downloadAll}
                variant="secondary"
                icon={Archive}
              >
                Download All
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ml-20 md:ml-auto transition-all duration-300">
        {/* Validation Results */}
        {showValidation && validationResults.length > 0 && (
          <div className={`glass-card rounded-xl p-6 mb-8 ${isDark ? 'dark' : ''}`}>
            <h2 className="text-lg font-medium mb-4">Configuration Check Results</h2>
            <div className="space-y-4">
              {validationResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-start p-4 rounded-lg ${
                    result.status === 'error'
                      ? isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-800'
                      : result.status === 'warning'
                      ? isDark ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-50 text-yellow-800'
                      : isDark ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-800'
                  }`}
                >
                  {result.status === 'error' ? (
                    <XCircle className="h-5 w-5 mt-0.5" />
                  ) : result.status === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 mt-0.5" />
                  )}
                  <div className="ml-3">
                    <p className="text-sm font-medium">
                      {result.message}
                    </p>
                    {result.fix && (
                      <p className="text-sm mt-1 opacity-80">
                        Suggestion: {result.fix}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration Export */}
        {showConfigExport && (
          <div className="mb-8">
            <NetworkConfigExport config={config} isDark={isDark} />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setShowConfigExport(false)}
                variant="outline"
              >
                Close Export View
              </Button>
            </div>
          </div>
        )}

        {/* Templates Section */}
        <div className={`glass-card rounded-xl p-6 mb-8 ${isDark ? 'dark' : ''}`}>
          <h2 className="text-lg font-medium mb-4">Network Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {NETWORK_TEMPLATES.map(template => (
              <div
                key={template.id}
                className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover-scale ${
                  selectedTemplate?.id === template.id
                    ? isDark ? 'border-indigo-500 bg-indigo-900/30' : 'border-indigo-500 bg-indigo-50'
                    : isDark ? 'border-gray-700 hover:border-indigo-500' : 'hover:border-indigo-300'
                }`}
                onClick={() => applyTemplate(template)}
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
            ))}
          </div>
        </div>

        {/* Network Visualization */}
        <NetworkVisualizer config={config} onNodeClick={handleNodeClick} isDark={isDark} />

        {/* Organizations and Orderers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Organizations Section */}
          <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="ml-2 text-lg font-medium">Organizations</h2>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="New org name"
                  className={`px-3 py-2 text-sm rounded-lg ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                />
                <Button
                  onClick={addOrganization}
                  variant="primary"
                  icon={Plus}
                >
                  Add Org
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              {config.organizations.map(org => (
                <div 
                  key={org.id} 
                  className={`border rounded-lg p-4 ${
                    isDark ? 'border-gray-700 hover:border-indigo-500' : 'hover:border-indigo-300'
                  } transition-colors duration-200 hover-scale`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {editingOrg === org.id ? (
                      <input
                        type="text"
                        value={org.name}
                        onChange={(e) => updateOrganization(org.id, { name: e.target.value })}
                        className={`block w-full rounded-lg ${
                          isDark 
                            ? 'bg-gray-800 border-gray-700 text-white'
                            : 'bg-white border-gray-300 text-gray-900'
                        } border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      />
                    ) : (
                      <h3 className="text-sm font-medium">{org.name}</h3>
                    )}
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={() => addPeer(org.id)}
                        variant="secondary"
                        size="sm"
                        icon={Plus}
                      >
                        Add Peer
                      </Button>
                      <Button
                        onClick={() => setEditingOrg(editingOrg === org.id ? null : org.id)}
                        variant="outline"
                        size="sm"
                        icon={Edit2}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => deleteOrganization(org.id)}
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm opacity-70">
                    <div>Domain: {org.domain}</div>
                    <div>MSP ID: {org.mspID}</div>
                    <div className="mt-2">
                      <strong>Peers ({org.peers.length}):</strong>
                      <div className="ml-2 space-y-1">
                        {org.peers.map(peer => (
                          <div key={peer.id} className="flex items-center justify-between py-1">
                            {editingPeer?.orgId === org.id && editingPeer?.peerId === peer.id ? (
                              <div className="flex items-center space-x-2 flex-grow">
                                <input
                                  type="text"
                                  value={peer.name}
                                  onChange={(e) => updatePeer(org.id, peer.id, { name: e.target.value })}
                                  className={`block w-32 rounded-lg ${
                                    isDark 
                                      ? 'bg-gray-800 border-gray-700 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  } border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                />
                                <input
                                  type="number"
                                  value={peer.port}
                                  onChange={(e) => updatePeer(org.id, peer.id, { port: parseInt(e.target.value) })}
                                  className={`block w-24 rounded-lg ${
                                    isDark 
                                      ? 'bg-gray-800 border-gray-700 text-white'
                                      : 'bg-white border-gray-300 text-gray-900'
                                  } border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                />
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => setEditingPeer(null)}
                                    className={`p-1 rounded-full ${
                                      isDark 
                                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                    }`}
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => updatePeer(org.id, peer.id, { name: peer.name, port: peer.port })}
                                    className={`p-1 rounded-full ${
                                      isDark 
                                        ? 'hover:bg-green-900/50 text-green-400 hover:text-green-300'
                                        : 'hover:bg-green-100 text-green-600 hover:text-green-700'
                                    }`}
                                  >
                                    <Check className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <span>{peer.name}</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs opacity-70">Port: {peer.port}</span>
                                  <button
                                    onClick={() => setEditingPeer({ orgId: org.id, peerId: peer.id })}
                                    className={`p-1 rounded-full ${
                                      isDark 
                                        ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                                        : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                                    }`}
                                  >
                                    <Edit2 className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => deletePeer(org.id, peer.id)}
                                    className={`p-1 rounded-full ${
                                      isDark 
                                        ? 'hover:bg-red-900/50 text-red-400 hover:text-red-300'
                                        : 'hover:bg-red-100 text-red-500 hover:text-red-600'
                                    }`}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orderers Section */}
          <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Server className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="ml-2 text-lg font-medium">Orderers</h2>
              </div>
              <Button
                onClick={addOrderer}
                variant="primary"
                icon={Plus}
              >
                Add Orderer
              </Button>
            </div>

            <div className="space-y-4">
              {config.orderers.map(orderer => (
                <div 
                  key={orderer.id} 
                  className={`border rounded-lg p-4 ${
                    isDark ? 'border-gray-700 hover:border-indigo-500' : 'hover:border-indigo-300'
                  } transition-colors duration-200 hover-scale`}
                >
                  <div className="flex items-center justify-between mb-2">
                    {editingOrderer === orderer.id ? (
                      <div className="flex items-center space-x-2 flex-grow">
                        <input
                          type="text"
                          value={orderer.name}
                          onChange={(e) => updateOrderer(orderer.id, { name: e.target.value })}
                          className={`block w-32 rounded-lg ${
                            isDark 
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                        <input
                          type="number"
                          value={orderer.port}
                          onChange={(e) => updateOrderer(orderer.id, { port: parseInt(e.target.value) })}
                          className={`block w-24 rounded-lg ${
                            isDark 
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                        <select
                          value={orderer.type}
                          onChange={(e) => updateOrderer(orderer.id, { type: e.target.value as 'solo' | 'etcdraft' })}
                          className={`block w-28 rounded-lg ${
                            isDark 
                              ? 'bg-gray-800 border-gray-700 text-white'
                              : 'bg-white border-gray-300 text-gray-900'
                          } border px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        >
                          <option value="solo">Solo</option>
                          <option value="etcdraft">Raft</option>
                        </select>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => setEditingOrderer(null)}
                            className={`p-1 rounded-full ${
                              isDark 
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => updateOrderer(orderer.id, {
                              name: orderer.name,
                              port: orderer.port,
                              type: orderer.type
                            })}
                            className={`p-1 rounded-full ${
                              isDark 
                                ? 'hover:bg-green-900/50 text-green-400 hover:text-green-300'
                                : 'hover:bg-green-100 text-green-600 hover:text-green-700'
                            }`}
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-sm font-medium">{orderer.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => setEditingOrderer(orderer.id)}
                            variant="outline"
                            size="sm"
                            icon={Edit2}
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => deleteOrderer(orderer.id)}
                            variant="danger"
                            size="sm"
                            icon={Trash2}
                          >
                            Delete
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-sm opacity-70">
                    <div>Domain: {orderer.domain}</div>
                    <div>Port: {orderer.port}</div>
                    <div>Type: {orderer.type}</div>
                    <div>Batch Timeout: {orderer.batchTimeout}</div>
                    <div className="mt-1">Batch Size:</div>
                    <div className="ml-2">
                      <div>Max Message Count: {orderer.batchSize?.maxMessageCount}</div>
                      <div>Absolute Max Bytes: {orderer.batchSize?.absoluteMaxBytes}</div>
                      <div>Preferred Max Bytes: {orderer.batchSize?.preferredMaxBytes}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}