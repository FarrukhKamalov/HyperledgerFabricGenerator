import React, { useState } from 'react';
import { Play, Send, ChevronDown, ChevronRight, Copy, Check, Save, Trash2 } from 'lucide-react';
import Card from '../common/Card';
import Button from '../ui/Button';
import { ApiConfig, ApiEndpoint } from '../../types/api';

interface ApiTesterProps {
  apiConfig: ApiConfig;
  isDark: boolean;
}

interface TestRequest {
  id: string;
  name: string;
  endpoint: ApiEndpoint;
  headers: { key: string; value: string; enabled: boolean }[];
  params: { key: string; value: string; enabled: boolean }[];
  body: string;
}

interface TestResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
}

const ApiTester: React.FC<ApiTesterProps> = ({ apiConfig, isDark }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  const [requestHeaders, setRequestHeaders] = useState<{ key: string; value: string; enabled: boolean }[]>([
    { key: 'Content-Type', value: 'application/json', enabled: true }
  ]);
  const [requestParams, setRequestParams] = useState<{ key: string; value: string; enabled: boolean }[]>([]);
  const [requestBody, setRequestBody] = useState('');
  const [response, setResponse] = useState<TestResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedRequests, setSavedRequests] = useState<TestRequest[]>([]);
  const [requestName, setRequestName] = useState('');
  const [expandedSection, setExpandedSection] = useState<'headers' | 'params' | 'body' | null>('body');
  const [copied, setCopied] = useState(false);

  const handleEndpointSelect = (endpoint: ApiEndpoint) => {
    setSelectedEndpoint(endpoint);
    
    // Initialize params based on endpoint parameters
    const pathParams = endpoint.parameters.filter(p => p.in === 'path').map(p => ({
      key: p.name,
      value: '',
      enabled: true
    }));
    
    const queryParams = endpoint.parameters.filter(p => p.in === 'query').map(p => ({
      key: p.name,
      value: '',
      enabled: true
    }));
    
    setRequestParams([...pathParams, ...queryParams]);
    
    // Initialize body if endpoint has body parameters
    if (endpoint.parameters.some(p => p.in === 'body')) {
      const bodyObj = endpoint.parameters
        .filter(p => p.in === 'body')
        .reduce((acc, param) => {
          acc[param.name] = param.type === 'string' ? '' : 
                           param.type === 'number' ? 0 : 
                           param.type === 'boolean' ? false : {};
          return acc;
        }, {} as Record<string, any>);
      
      setRequestBody(JSON.stringify(bodyObj, null, 2));
    } else {
      setRequestBody('');
    }
    
    // Add auth header if required
    if (endpoint.requiresAuth) {
      if (apiConfig.authType === 'jwt' && !requestHeaders.some(h => h.key === 'Authorization')) {
        setRequestHeaders([
          ...requestHeaders,
          { key: 'Authorization', value: 'Bearer YOUR_JWT_TOKEN', enabled: true }
        ]);
      } else if (apiConfig.authType === 'apikey' && !requestHeaders.some(h => h.key === 'X-API-Key')) {
        setRequestHeaders([
          ...requestHeaders,
          { key: 'X-API-Key', value: 'YOUR_API_KEY', enabled: true }
        ]);
      }
    }
    
    setResponse(null);
    setRequestName(`${endpoint.method} ${endpoint.path}`);
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...requestHeaders];
    newHeaders[index][field] = value;
    setRequestHeaders(newHeaders);
  };

  const handleHeaderToggle = (index: number) => {
    const newHeaders = [...requestHeaders];
    newHeaders[index].enabled = !newHeaders[index].enabled;
    setRequestHeaders(newHeaders);
  };

  const addHeader = () => {
    setRequestHeaders([...requestHeaders, { key: '', value: '', enabled: true }]);
  };

  const removeHeader = (index: number) => {
    const newHeaders = [...requestHeaders];
    newHeaders.splice(index, 1);
    setRequestHeaders(newHeaders);
  };

  const handleParamChange = (index: number, field: 'key' | 'value', value: string) => {
    const newParams = [...requestParams];
    newParams[index][field] = value;
    setRequestParams(newParams);
  };

  const handleParamToggle = (index: number) => {
    const newParams = [...requestParams];
    newParams[index].enabled = !newParams[index].enabled;
    setRequestParams(newParams);
  };

  const addParam = () => {
    setRequestParams([...requestParams, { key: '', value: '', enabled: true }]);
  };

  const removeParam = (index: number) => {
    const newParams = [...requestParams];
    newParams.splice(index, 1);
    setRequestParams(newParams);
  };

  const saveRequest = () => {
    if (!selectedEndpoint || !requestName.trim()) return;
    
    const newRequest: TestRequest = {
      id: crypto.randomUUID(),
      name: requestName,
      endpoint: selectedEndpoint,
      headers: [...requestHeaders],
      params: [...requestParams],
      body: requestBody
    };
    
    setSavedRequests([...savedRequests, newRequest]);
  };

  const loadRequest = (request: TestRequest) => {
    setSelectedEndpoint(request.endpoint);
    setRequestHeaders(request.headers);
    setRequestParams(request.params);
    setRequestBody(request.body);
    setRequestName(request.name);
    setResponse(null);
  };

  const deleteRequest = (id: string) => {
    setSavedRequests(savedRequests.filter(req => req.id !== id));
  };

  const sendRequest = () => {
    if (!selectedEndpoint) return;
    
    setIsLoading(true);
    
    // In a real implementation, this would make an actual HTTP request
    // For this demo, we'll simulate a response
    setTimeout(() => {
      const mockResponse: TestResponse = {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'date': new Date().toUTCString()
        },
        body: JSON.stringify({
          success: true,
          data: selectedEndpoint.method === 'GET' ? {
            id: '123456',
            name: 'Sample Asset',
            value: 1000,
            owner: 'User1',
            timestamp: new Date().toISOString()
          } : {
            message: 'Operation completed successfully',
            transactionId: '0x' + Math.random().toString(16).slice(2, 10)
          }
        }, null, 2),
        time: Math.floor(Math.random() * 500) + 100 // Random time between 100-600ms
      };
      
      setResponse(mockResponse);
      setIsLoading(false);
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleSection = (section: 'headers' | 'params' | 'body') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-6">
      <Card isDark={isDark}>
        <div className="flex items-center mb-6">
          <Play className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
          <h2 className="text-lg font-medium">API Tester</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Saved Requests</h3>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} max-h-[200px] overflow-y-auto`}>
                {savedRequests.length > 0 ? (
                  <div className="space-y-2">
                    {savedRequests.map((request) => (
                      <div 
                        key={request.id}
                        className={`p-2 rounded flex items-center justify-between ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                        } cursor-pointer transition-colors`}
                      >
                        <div 
                          className="flex-grow truncate mr-2"
                          onClick={() => loadRequest(request)}
                        >
                          <span className="text-xs font-medium">{request.name}</span>
                        </div>
                        <button
                          onClick={() => deleteRequest(request.id)}
                          className={`p-1 rounded-full ${
                            isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-300'
                          }`}
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-sm opacity-70">
                    No saved requests
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-sm font-medium mb-2">Endpoints</h3>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} max-h-[400px] overflow-y-auto`}>
              {apiConfig.endpoints.length > 0 ? (
                <div className="space-y-2">
                  {apiConfig.endpoints.map((endpoint) => (
                    <div
                      key={endpoint.id}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        selectedEndpoint?.id === endpoint.id
                          ? isDark ? 'bg-indigo-900/30 border-l-4 border-indigo-500' : 'bg-indigo-50 border-l-4 border-indigo-500'
                          : isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                      }`}
                      onClick={() => handleEndpointSelect(endpoint)}
                    >
                      <div className="flex items-center">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium mr-2 ${
                          endpoint.method === 'GET' ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800' :
                          endpoint.method === 'POST' ? isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800' :
                          endpoint.method === 'PUT' ? isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800' :
                          isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                        }`}>
                          {endpoint.method}
                        </span>
                        <span className="text-xs truncate">{endpoint.path}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-sm opacity-70">
                  No endpoints defined
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedEndpoint ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium mr-2 ${
                      selectedEndpoint.method === 'GET' ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800' :
                      selectedEndpoint.method === 'POST' ? isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800' :
                      selectedEndpoint.method === 'PUT' ? isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800' :
                      isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedEndpoint.method}
                    </span>
                    <span className="font-mono text-sm">{selectedEndpoint.path}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={requestName}
                      onChange={(e) => setRequestName(e.target.value)}
                      placeholder="Request name"
                      className={`px-3 py-1 text-sm rounded-lg ${
                        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                    <Button
                      onClick={saveRequest}
                      variant="outline"
                      size="sm"
                      icon={Save}
                    >
                      Save
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 mb-4">
                  {/* Headers Section */}
                  <div>
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection('headers')}
                    >
                      <h3 className="text-sm font-medium">Headers</h3>
                      {expandedSection === 'headers' ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                    
                    {expandedSection === 'headers' && (
                      <div className={`mt-2 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="space-y-2">
                          {requestHeaders.map((header, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={header.enabled}
                                onChange={() => handleHeaderToggle(index)}
                                className={isDark ? 'bg-gray-700' : 'bg-white'}
                              />
                              <input
                                type="text"
                                value={header.key}
                                onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                                placeholder="Header"
                                className={`flex-1 px-3 py-1 text-sm rounded-lg ${
                                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                              />
                              <input
                                type="text"
                                value={header.value}
                                onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                                placeholder="Value"
                                className={`flex-1 px-3 py-1 text-sm rounded-lg ${
                                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                              />
                              <button
                                onClick={() => removeHeader(index)}
                                className={`p-1 rounded-full ${
                                  isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-300'
                                }`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={addHeader}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          Add Header
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Parameters Section */}
                  <div>
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection('params')}
                    >
                      <h3 className="text-sm font-medium">Parameters</h3>
                      {expandedSection === 'params' ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                    
                    {expandedSection === 'params' && (
                      <div className={`mt-2 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        {requestParams.length > 0 ? (
                          <div className="space-y-2">
                            {requestParams.map((param, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={param.enabled}
                                  onChange={() => handleParamToggle(index)}
                                  className={isDark ? 'bg-gray-700' : 'bg-white'}
                                />
                                <input
                                  type="text"
                                  value={param.key}
                                  onChange={(e) => handleParamChange(index, 'key', e.target.value)}
                                  placeholder="Parameter"
                                  className={`flex-1 px-3 py-1 text-sm rounded-lg ${
                                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                />
                                <input
                                  type="text"
                                  value={param.value}
                                  onChange={(e) => handleParamChange(index, 'value', e.target.value)}
                                  placeholder="Value"
                                  className={`flex-1 px-3 py-1 text-sm rounded-lg ${
                                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                />
                                <button
                                  onClick={() => removeParam(index)}
                                  className={`p-1 rounded-full ${
                                    isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-300'
                                  }`}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm opacity-70 mb-2">No parameters</div>
                        )}
                        <Button
                          onClick={addParam}
                          variant="outline"
                          size="sm"
                          className="mt-2"
                        >
                          Add Parameter
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Request Body Section */}
                  <div>
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSection('body')}
                    >
                      <h3 className="text-sm font-medium">Request Body</h3>
                      {expandedSection === 'body' ? (
                        <ChevronDown className="h-5 w-5" />
                      ) : (
                        <ChevronRight className="h-5 w-5" />
                      )}
                    </div>
                    
                    {expandedSection === 'body' && (
                      <div className={`mt-2 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        {selectedEndpoint.method !== 'GET' ? (
                          <textarea
                            value={requestBody}
                            onChange={(e) => setRequestBody(e.target.value)}
                            rows={8}
                            className={`w-full px-3 py-2 font-mono text-sm rounded-lg ${
                              isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                            } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                          />
                        ) : (
                          <div className="text-sm opacity-70">
                            GET requests do not have a request body
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mb-6">
                  <Button
                    onClick={sendRequest}
                    variant="primary"
                    icon={Send}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Request'}
                  </Button>
                </div>

                {response && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Response</h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs opacity-70">{response.time}ms</span>
                        <Button
                          onClick={() => copyToClipboard(response.body)}
                          variant="outline"
                          size="sm"
                          icon={copied ? Check : Copy}
                        >
                          {copied ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                      <div className="flex items-center mb-2">
                        <div className={`px-2 py-1 rounded-md text-xs font-medium mr-2 ${
                          response.status >= 200 && response.status < 300
                            ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                            : isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                        }`}>
                          {response.status} {response.statusText}
                        </div>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-xs font-medium mb-1">Headers</h4>
                        <div className={`p-2 rounded-lg text-xs font-mono ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          {Object.entries(response.headers).map(([key, value]) => (
                            <div key={key}>
                              <span className="opacity-70">{key}:</span> {value}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-medium mb-1">Body</h4>
                        <pre className={`p-2 rounded-lg text-xs font-mono overflow-auto max-h-[300px] ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          {response.body}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
                <Play className="h-12 w-12 mx-auto opacity-50 mb-4" />
                <h3 className="text-lg font-medium mb-2">API Tester</h3>
                <p className="text-sm opacity-70 mb-4">
                  Select an endpoint from the list to start testing your API.
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ApiTester;