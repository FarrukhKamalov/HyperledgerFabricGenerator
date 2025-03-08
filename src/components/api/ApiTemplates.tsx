import React from 'react';
import { FileJson, Check } from 'lucide-react';
import Card from '../common/Card';
import Button from '../ui/Button';
import { ApiTemplate } from '../../types/api';
import { SUPPLY_CHAIN_TEMPLATE, IDENTITY_TEMPLATE, FINANCIAL_TEMPLATE } from '../../data/apiTemplates';

interface ApiTemplatesProps {
  onApplyTemplate: (template: ApiTemplate) => void;
  isDark: boolean;
}

const ApiTemplates: React.FC<ApiTemplatesProps> = ({ onApplyTemplate, isDark }) => {
  const templates = [SUPPLY_CHAIN_TEMPLATE, IDENTITY_TEMPLATE, FINANCIAL_TEMPLATE];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} isDark={isDark} className="hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <FileJson className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
              <h3 className="text-lg font-medium">{template.name}</h3>
            </div>
            <p className="text-sm opacity-70 mb-4">{template.description}</p>
            <div className="space-y-2 mb-6">
              <div className="text-sm">
                <span className="font-medium">Endpoints:</span> {template.endpoints.length}
              </div>
              <div className="text-sm">
                <span className="font-medium">Authentication:</span> {template.authType.toUpperCase()}
              </div>
              <div className="text-sm">
                <span className="font-medium">Language:</span> {template.language === 'javascript' ? 'JavaScript' : 'TypeScript'}
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <h4 className="text-sm font-medium">Included Endpoints:</h4>
              <ul className="text-xs space-y-1 ml-4 list-disc">
                {template.endpoints.slice(0, 4).map((endpoint) => (
                  <li key={endpoint.id}>
                    <span className={`font-mono ${
                      endpoint.method === 'GET' ? 'text-green-600 dark:text-green-400' :
                      endpoint.method === 'POST' ? 'text-blue-600 dark:text-blue-400' :
                      endpoint.method === 'PUT' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>{endpoint.method}</span> {endpoint.path}
                  </li>
                ))}
                {template.endpoints.length > 4 && (
                  <li className="opacity-70">+ {template.endpoints.length - 4} more</li>
                )}
              </ul>
            </div>
            <Button
              onClick={() => onApplyTemplate(template)}
              variant="primary"
              className="w-full"
              icon={Check}
            >
              Use Template
            </Button>
          </Card>
        ))}
      </div>

      <Card isDark={isDark}>
        <div className="flex items-center mb-4">
          <FileJson className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
          <h3 className="text-lg font-medium">Custom Template</h3>
        </div>
        <p className="text-sm opacity-70 mb-6">
          Create a custom API template from scratch or modify an existing template to suit your specific needs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className="text-sm font-medium mb-2">Start from Scratch</h4>
            <p className="text-xs opacity-70">
              Build your API from the ground up with complete control over all endpoints and configurations.
            </p>
          </div>
          <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <h4 className="text-sm font-medium mb-2">Import from Chaincode</h4>
            <p className="text-xs opacity-70">
              Automatically generate API endpoints based on your existing chaincode functions.
            </p>
          </div>
        </div>
        <Button
          onClick={() => onApplyTemplate({
            id: 'custom',
            name: 'Custom API',
            description: 'Custom API template',
            baseUrl: '/api',
            port: 3000,
            endpoints: [],
            authType: 'jwt',
            roles: ['admin', 'user'],
            language: 'javascript'
          })}
          variant="outline"
          className="w-full"
        >
          Create Custom Template
        </Button>
      </Card>
    </div>
  );
};

export default ApiTemplates;