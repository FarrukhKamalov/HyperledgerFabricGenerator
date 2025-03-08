import React, { useState } from 'react';
import { Shield, Key, Lock, User, UserPlus, Settings, Save } from 'lucide-react';
import Card from '../common/Card';
import Button from '../ui/Button';
import { ApiConfig, AuthType } from '../../types/api';

interface ApiSecurityProps {
  apiConfig: ApiConfig;
  onUpdateConfig: (updates: Partial<ApiConfig>) => void;
  isDark: boolean;
}

const ApiSecurity: React.FC<ApiSecurityProps> = ({ apiConfig, onUpdateConfig, isDark }) => {
  const [authType, setAuthType] = useState<AuthType>(apiConfig.authType);
  const [jwtSettings, setJwtSettings] = useState({
    secret: 'your-secret-key',
    expiresIn: '1h',
    refreshToken: true
  });
  const [apiKeySettings, setApiKeySettings] = useState({
    headerName: 'X-API-Key',
    keyLength: 32
  });
  const [roles, setRoles] = useState(apiConfig.roles);
  const [newRole, setNewRole] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const handleAuthTypeChange = (type: AuthType) => {
    setAuthType(type);
  };

  const handleJwtSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setJwtSettings({ ...jwtSettings, [name]: checked });
    } else {
      setJwtSettings({ ...jwtSettings, [name]: value });
    }
  };

  const handleApiKeySettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'keyLength') {
      setApiKeySettings({ ...apiKeySettings, [name]: parseInt(value) });
    } else {
      setApiKeySettings({ ...apiKeySettings, [name]: value });
    }
  };

  const addRole = () => {
    if (newRole.trim() === '') return;
    if (!roles.includes(newRole.trim())) {
      setRoles([...roles, newRole.trim()]);
    }
    setNewRole('');
  };

  const removeRole = (role: string) => {
    setRoles(roles.filter(r => r !== role));
  };

  const saveSettings = () => {
    onUpdateConfig({
      authType,
      roles
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card isDark={isDark}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-lg font-medium">Authentication & Security</h2>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            size="sm"
            icon={isEditing ? Save : Settings}
          >
            {isEditing ? 'Save Settings' : 'Edit Settings'}
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-4">Authentication Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  authType === 'jwt'
                    ? isDark ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50'
                    : isDark ? 'border-gray-700 hover:border-indigo-500' : 'border-gray-200 hover:border-indigo-300'
                }`}
                onClick={() => isEditing && handleAuthTypeChange('jwt')}
              >
                <div className="flex items-center mb-2">
                  <Lock className={`h-5 w-5 mr-2 ${
                    authType === 'jwt' ? 'text-indigo-500' : 'text-gray-500'
                  }`} />
                  <h4 className="font-medium">JWT Authentication</h4>
                </div>
                <p className="text-xs opacity-70">
                  JSON Web Tokens for secure, stateless authentication with role-based access control.
                </p>
              </div>
              
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  authType === 'apikey'
                    ? isDark ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50'
                    : isDark ? 'border-gray-700 hover:border-indigo-500' : 'border-gray-200 hover:border-indigo-300'
                }`}
                onClick={() => isEditing && handleAuthTypeChange('apikey')}
              >
                <div className="flex items-center mb-2">
                  <Key className={`h-5 w-5 mr-2 ${
                    authType === 'apikey' ? 'text-indigo-500' : 'text-gray-500'
                  }`} />
                  <h4 className="font-medium">API Key</h4>
                </div>
                <p className="text-xs opacity-70">
                  Simple API key authentication for machine-to-machine communication.
                </p>
              </div>
              
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  authType === 'none'
                    ? isDark ? 'border-indigo-500 bg-indigo-900/20' : 'border-indigo-500 bg-indigo-50'
                    : isDark ? 'border-gray-700 hover:border-indigo-500' : 'border-gray-200 hover:border-indigo-300'
                }`}
                onClick={() => isEditing && handleAuthTypeChange('none')}
              >
                <div className="flex items-center mb-2">
                  <Shield className={`h-5 w-5 mr-2 ${
                    authType === 'none' ? 'text-indigo-500' : 'text-gray-500'
                  }`} />
                  <h4 className="font-medium">No Authentication</h4>
                </div>
                <p className="text-xs opacity-70">
                  Open access without authentication. Not recommended for production.
                </p>
              </div>
            </div>
          </div>

          {authType === 'jwt' && (
            <div>
              <h3 className="text-sm font-medium mb-4">JWT Settings</h3>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Secret Key</label>
                    <input
                      type="text"
                      name="secret"
                      value={jwtSettings.secret}
                      onChange={handleJwtSettingChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        !isEditing ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expires In</label>
                    <select
                      name="expiresIn"
                      value={jwtSettings.expiresIn}
                      onChange={handleJwtSettingChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        !isEditing ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="15m">15 minutes</option>
                      <option value="30m">30 minutes</option>
                      <option value="1h">1 hour</option>
                      <option value="6h">6 hours</option>
                      <option value="12h">12 hours</option>
                      <option value="1d">1 day</option>
                      <option value="7d">7 days</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="refreshToken"
                    checked={jwtSettings.refreshToken}
                    onChange={handleJwtSettingChange}
                    disabled={!isEditing}
                    className={`mr-2 ${!isEditing ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                  <label className="text-sm">Enable Refresh Tokens</label>
                </div>
                <div className="text-xs opacity-70">
                  <p>JWT authentication will be implemented with the following features:</p>
                  <ul className="list-disc ml-4 mt-2 space-y-1">
                    <li>User registration and login endpoints</li>
                    <li>Password hashing with bcrypt</li>
                    <li>Role-based access control</li>
                    <li>Token verification middleware</li>
                    {jwtSettings.refreshToken && <li>Refresh token rotation</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {authType === 'apikey' && (
            <div>
              <h3 className="text-sm font-medium mb-4">API Key Settings</h3>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Header Name</label>
                    <input
                      type="text"
                      name="headerName"
                      value={apiKeySettings.headerName}
                      onChange={handleApiKeySettingChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        !isEditing ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Key Length</label>
                    <select
                      name="keyLength"
                      value={apiKeySettings.keyLength.toString()}
                      onChange={handleApiKeySettingChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 rounded-lg ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        !isEditing ? 'opacity-60 cursor-not-allowed' : ''
                      }`}
                    >
                      <option value="16">16 characters</option>
                      <option value="24">24 characters</option>
                      <option value="32">32 characters</option>
                      <option value="48">48 characters</option>
                      <option value="64">64 characters</option>
                    </select>
                  </div>
                </div>
                <div className="text-xs opacity-70">
                  <p>API Key authentication will be implemented with the following features:</p>
                  <ul className="list-disc ml-4 mt-2 space-y-1">
                    <li>API key generation and management endpoints</li>
                    <li>Key verification middleware</li>
                    <li>Rate limiting per API key</li>
                    <li>Key expiration and rotation capabilities</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium mb-4">Role-Based Access Control</h3>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Available Roles</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {roles.map((role) => (
                    <div 
                      key={role}
                      className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
                        isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {role}
                      {isEditing && (
                        <button
                          onClick={() => removeRole(role)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex">
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="New role name"
                      className={`flex-grow px-3 py-2 rounded-l-lg ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                    <Button
                      onClick={addRole}
                      variant="primary"
                      className="rounded-l-none"
                    >
                      Add Role
                    </Button>
                  </div>
                )}
              </div>
              <div className="text-xs opacity-70">
                <p>Role-based access control allows you to:</p>
                <ul className="list-disc ml-4 mt-2 space-y-1">
                  <li>Restrict access to specific endpoints based on user roles</li>
                  <li>Implement hierarchical permissions</li>
                  <li>Separate administrative functions from regular user operations</li>
                  <li>Apply fine-grained access control to your API</li>
                </ul>
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <Button
                onClick={saveSettings}
                variant="primary"
                icon={Save}
              >
                Save Security Settings
              </Button>
            </div>
          )}
        </div>
      </Card>

      <Card isDark={isDark}>
        <div className="flex items-center mb-4">
          <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
          <h2 className="text-lg font-medium">User Management</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-sm opacity-70">
            The generated API will include the following user management endpoints:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center mb-2">
                <UserPlus className="h-5 w-5 mr-2 text-green-500" />
                <h4 className="font-medium">Registration</h4>
              </div>
              <div className="text-xs opacity-70">
                <p className="mb-2">POST /auth/register</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Email and password validation</li>
                  <li>Password hashing</li>
                  <li>Default role assignment</li>
                </ul>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center mb-2">
                <Lock className="h-5 w-5 mr-2 text-blue-500" />
                <h4 className="font-medium">Authentication</h4>
              </div>
              <div className="text-xs opacity-70">
                <p className="mb-2">POST /auth/login</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Credential verification</li>
                  <li>JWT token generation</li>
                  <li>Refresh token (if enabled)</li>
                </ul>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 mr-2 text-purple-500" />
                <h4 className="font-medium">User Profile</h4>
              </div>
              <div className="text-xs opacity-70">
                <p className="mb-2">GET /users/profile</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Retrieve user information</li>
                  <li>Update profile details</li>
                  <li>Change password functionality</li>
                </ul>
              </div>
            </div>
            
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center mb-2">
                <Settings className="h-5 w-5 mr-2 text-yellow-500" />
                <h4 className="font-medium">Admin Functions</h4>
              </div>
              <div className="text-xs opacity-70">
                <p className="mb-2">Various admin endpoints</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>User management</li>
                  <li>Role assignment</li>
                  <li>Account status control</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ApiSecurity;