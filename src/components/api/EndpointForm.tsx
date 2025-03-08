import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { ApiEndpoint, Parameter } from '../../types/api';

interface EndpointFormProps {
  initialValues?: ApiEndpoint;
  onSubmit: (endpoint: ApiEndpoint) => void;
  onCancel: () => void;
  isDark: boolean;
}

const EndpointForm: React.FC<EndpointFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
  isDark
}) => {
  const [formData, setFormData] = useState<ApiEndpoint>(
    initialValues || {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      path: '',
      method: 'GET',
      chaincode: '',
      function: '',
      parameters: [],
      responses: {
        '200': { description: 'Success' },
        '400': { description: 'Bad Request' },
        '500': { description: 'Internal Server Error' }
      },
      requiresAuth: false,
      roles: []
    }
  );

  const [newParam, setNewParam] = useState<Parameter>({
    name: '',
    type: 'string',
    required: true,
    in: 'query'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
    const { name, value, type } = e.target;
    const updatedParams = [...formData.parameters];
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      updatedParams[index] = { ...updatedParams[index], [name]: checked };
    } else {
      updatedParams[index] = { ...updatedParams[index], [name]: value };
    }
    
    setFormData({ ...formData, parameters: updatedParams });
  };

  const handleNewParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setNewParam({ ...newParam, [name]: checked });
    } else {
      setNewParam({ ...newParam, [name]: value });
    }
  };

  const addParameter = () => {
    if (newParam.name.trim() === '') return;
    
    setFormData({
      ...formData,
      parameters: [...formData.parameters, { ...newParam }]
    });
    
    setNewParam({
      name: '',
      type: 'string',
      required: true,
      in: 'query'
    });
  };

  const removeParameter = (index: number) => {
    const updatedParams = [...formData.parameters];
    updatedParams.splice(index, 1);
    setFormData({ ...formData, parameters: updatedParams });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    
    if (checked) {
      setFormData({ ...formData, roles: [...formData.roles, value] });
    } else {
      setFormData({ ...formData, roles: formData.roles.filter(role => role !== value) });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Endpoint Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className={`w-full px-3 py-2 rounded-lg ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">HTTP Method</label>
          <select
            name="method"
            value={formData.method}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 rounded-lg ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Path</label>
        <input
          type="text"
          name="path"
          value={formData.path}
          onChange={handleInputChange}
          placeholder="/api/resource/:id"
          required
          className={`w-full px-3 py-2 rounded-lg ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
          } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={2}
          className={`w-full px-3 py-2 rounded-lg ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
          } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Chaincode</label>
          <input
            type="text"
            name="chaincode"
            value={formData.chaincode}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 rounded-lg ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Function</label>
          <input
            type="text"
            name="function"
            value={formData.function}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 rounded-lg ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
            } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium">Parameters</label>
        </div>
        
        <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="grid grid-cols-12 gap-2 mb-2">
            <div className="col-span-3">
              <input
                type="text"
                name="name"
                value={newParam.name}
                onChange={handleNewParamChange}
                placeholder="Name"
                className={`w-full px-2 py-1 text-sm rounded-lg ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                } border focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              />
            </div>
            <div className="col-span-2">
              <select
                name="type"
                value={newParam.type}
                onChange={handleNewParamChange}
                className={`w-full px-2 py-1 text-sm rounded-lg ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                } border focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              >
                <option value="string">string</option>
                <option value="number">number</option>
                <option value="boolean">boolean</option>
                <option value="object">object</option>
                <option value="array">array</option>
              </select>
            </div>
            <div className="col-span-3">
              <select
                name="in"
                value={newParam.in}
                onChange={handleNewParamChange}
                className={`w-full px-2 py-1 text-sm rounded-lg ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                } border focus:outline-none focus:ring-1 focus:ring-indigo-500`}
              >
                <option value="query">query</option>
                <option value="path">path</option>
                <option value="body">body</option>
                <option value="header">header</option>
              </select>
            </div>
            <div className="col-span-2">
              <div className="flex items-center h-full">
                <input
                  type="checkbox"
                  name="required"
                  checked={newParam.required}
                  onChange={handleNewParamChange}
                  className="mr-2"
                />
                <label className="text-sm">Required</label>
              </div>
            </div>
            <div className="col-span-2">
              <Button
                onClick={addParameter}
                variant="primary"
                size="sm"
                icon={Plus}
                className="w-full"
                type="button"
              >
                Add
              </Button>
            </div>
          </div>

          {formData.parameters.length > 0 ? (
            <div className="space-y-2 mt-4">
              {formData.parameters.map((param, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <input
                      type="text"
                      name="name"
                      value={param.name}
                      onChange={(e) => handleParamChange(e, index)}
                      className={`w-full px-2 py-1 text-sm rounded-lg ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                    />
                  </div>
                  <div className="col-span-2">
                    <select
                      name="type"
                      value={param.type}
                      onChange={(e) => handleParamChange(e, index)}
                      className={`w-full px-2 py-1 text-sm rounded-lg ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                    >
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="object">object</option>
                      <option value="array">array</option>
                    </select>
                  </div>
                  <div className="col-span-3">
                    <select
                      name="in"
                      value={param.in}
                      onChange={(e) => handleParamChange(e, index)}
                      className={`w-full px-2 py-1 text-sm rounded-lg ${
                        isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      } border focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                    >
                      <option value="query">query</option>
                      <option value="path">path</option>
                      <option value="body">body</option>
                      <option value="header">header</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="required"
                        checked={param.required}
                        onChange={(e) => handleParamChange(e, index)}
                        className="mr-2"
                      />
                      <label className="text-sm">Required</label>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Button
                      onClick={() => removeParameter(index)}
                      variant="danger"
                      size="sm"
                      icon={Trash2}
                      className="w-full"
                      type="button"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-2 text-sm opacity-70">
              No parameters added yet
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            name="requiresAuth"
            checked={formData.requiresAuth}
            onChange={handleInputChange}
            className="mr-2"
          />
          <label className="text-sm font-medium">Requires Authentication</label>
        </div>
        
        {formData.requiresAuth && (
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <label className="block text-sm font-medium mb-2">Required Roles</label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  value="admin"
                  checked={formData.roles.includes('admin')}
                  onChange={handleRoleChange}
                  className="mr-2"
                />
                <label className="text-sm">Admin</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  value="user"
                  checked={formData.roles.includes('user')}
                  onChange={handleRoleChange}
                  className="mr-2"
                />
                <label className="text-sm">User</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  value="guest"
                  checked={formData.roles.includes('guest')}
                  onChange={handleRoleChange}
                  className="mr-2"
                />
                <label className="text-sm">Guest</label>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          onClick={onCancel}
          variant="outline"
          type="button"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          type="submit"
        >
          {initialValues ? 'Update Endpoint' : 'Add Endpoint'}
        </Button>
      </div>
    </form>
  );
};

export default EndpointForm;