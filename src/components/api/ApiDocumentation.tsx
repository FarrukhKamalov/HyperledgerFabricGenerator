import React, { useState } from 'react';
import { FileJson, Copy, Check, Code, Download } from 'lucide-react';
import Card from '../common/Card';
import Button from '../ui/Button';
import { ApiConfig, ApiEndpoint } from '../../types/api';

interface ApiDocumentationProps {
  apiConfig: ApiConfig;
  isDark: boolean;
}

const ApiDocumentation: React.FC<ApiDocumentationProps> = ({ apiConfig, isDark }) => {
  const [copied, setCopied] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(null);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateSwaggerJson = () => {
    const swaggerJson = {
      openapi: '3.0.0',
      info: {
        title: apiConfig.name,
        description: apiConfig.description,
        version: apiConfig.version
      },
      servers: [
        {
          url: `http://localhost:${apiConfig.port}${apiConfig.baseUrl}`,
          description: 'Local development server'
        }
      ],
      components: {
        securitySchemes: apiConfig.authType === 'jwt' ? {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        } : apiConfig.authType === 'apikey' ? {
          apiKeyAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key'
          }
        } : {}
      },
      paths: apiConfig.endpoints.reduce((acc, endpoint) => {
        const parameters = endpoint.parameters
          .filter(param => param.in !== 'body')
          .map(param => ({
            name: param.name,
            in: param.in,
            required: param.required,
            schema: {
              type: param.type
            }
          }));
        
        const requestBody = endpoint.parameters.some(param => param.in === 'body')
          ? {
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: endpoint.parameters
                      .filter(param => param.in === 'body')
                      .reduce((props, param) => ({
                        ...props,
                        [param.name]: { type: param.type }
                      }), {}),
                    required: endpoint.parameters
                      .filter(param => param.in === 'body' && param.required)
                      .map(param => param.name)
                  }
                }
              }
            }
          : undefined;
        
        return {
          ...acc,
          [endpoint.path]: {
            [endpoint.method.toLowerCase()]: {
              summary: endpoint.name,
              description: endpoint.description,
              parameters,
              requestBody,
              security: endpoint.requiresAuth ? [
                apiConfig.authType === 'jwt' ? { bearerAuth: [] } : { apiKeyAuth: [] }
              ] : [],
              responses: Object.entries(endpoint.responses).reduce((respAcc, [code, response]) => ({
                ...respAcc,
                [code]: {
                  description: response.description
                }
              }), {})
            }
          }
        };
      }, {})
    };
    
    return JSON.stringify(swaggerJson, null, 2);
  };

  const generateEndpointDocs = (endpoint: ApiEndpoint) => {
    return `
## ${endpoint.name}

**Endpoint:** \`${endpoint.method} ${endpoint.path}\`

${endpoint.description}

${endpoint.requiresAuth ? `**Authentication Required:** Yes\n**Required Roles:** ${endpoint.roles.join(', ')}\n` : ''}

### Request

${endpoint.parameters.length > 0 ? `
#### Parameters

${endpoint.parameters.filter(p => p.in !== 'body').map(p => `- \`${p.name}\` (${p.in}) - ${p.type}${p.required ? ' (required)' : ''}`).join('\n')}

${endpoint.parameters.filter(p => p.in === 'body').length > 0 ? `
#### Request Body

\`\`\`json
{
${endpoint.parameters.filter(p => p.in === 'body').map(p => `  "${p.name}": "${p.type === 'string' ? 'value' : p.type === 'number' ? '0' : p.type === 'boolean' ? 'false' : '{}'}"${p.required ? ' // required' : ''}`).join(',\n')}
}
\`\`\`
` : ''}` : 'No parameters required.'}

### Response

${Object.entries(endpoint.responses).map(([code, response]) => `
#### ${code} - ${response.description}

\`\`\`json
// Example response for ${code}
${code.startsWith('2') ? 
  endpoint.method === 'GET' ? 
    '{\n  "data": {}\n}' : 
    '{\n  "message": "Operation successful"\n}' 
  : 
  '{\n  "error": "Error message"\n}'
}
\`\`\`
`).join('\n')}

### Example

\`\`\`javascript
// Example using fetch API
fetch('${apiConfig.baseUrl}${endpoint.path.replace(/:[a-zA-Z]+/g, 'value')}', {
  method: '${endpoint.method}',
  headers: {
    'Content-Type': 'application/json'${endpoint.requiresAuth ? `,
    ${apiConfig.authType === 'jwt' ? "'Authorization': 'Bearer YOUR_TOKEN'" : "'X-API-Key': 'YOUR_API_KEY'"}` : ''}
  }${endpoint.parameters.filter(p => p.in === 'body').length > 0 ? `,
  body: JSON.stringify({
    ${endpoint.parameters.filter(p => p.in === 'body').map(p => `${p.name}: ${p.type === 'string' ? '"value"' : p.type === 'number' ? '0' : p.type === 'boolean' ? 'false' : '{}'}`).join(',\n    ')}
  })` : ''}
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
\`\`\`
`;
  };

  const swaggerJson = generateSwaggerJson();

  return (
    <div className="space-y-6">
      <Card isDark={isDark}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileJson className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-lg font-medium">API Documentation</h2>
          </div>
          <Button
            onClick={() => {
              const blob = new Blob([swaggerJson], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'swagger.json';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            variant="primary"
            icon={Download}
          >
            Download Swagger JSON
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h3 className="text-sm font-medium mb-4">Endpoints</h3>
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {apiConfig.endpoints.map((endpoint) => (
                <div
                  key={endpoint.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedEndpoint?.id === endpoint.id
                      ? isDark ? 'bg-indigo-900/30 border-l-4 border-indigo-500' : 'bg-indigo-50 border-l-4 border-indigo-500'
                      : isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedEndpoint(endpoint)}
                >
                  <div className="flex items-center mb-1">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium mr-2 ${
                      endpoint.method === 'GET' ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800' :
                      endpoint.method === 'POST' ? isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800' :
                      endpoint.method === 'PUT' ? isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800' :
                      isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                    }`}>
                      {endpoint.method}
                    </span>
                    <span className="text-sm font-medium">{endpoint.name}</span>
                  </div>
                  <div className="text-xs font-mono opacity-70">{endpoint.path}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedEndpoint ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium">Endpoint Documentation</h3>
                  <Button
                    onClick={() => copyToClipboard(generateEndpointDocs(selectedEndpoint))}
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy Markdown'}
                  </Button>
                </div>
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} overflow-auto max-h-[600px]`}>
                  <div className="markdown-body" dangerouslySetInnerHTML={{ __html: generateEndpointDocs(selectedEndpoint) }} />
                </div>
              </div>
            ) : (
              <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
                <FileJson className="h-12 w-12 mx-auto opacity-50 mb-4" />
                <h3 className="text-lg font-medium mb-2">OpenAPI Documentation</h3>
                <p className="text-sm opacity-70 mb-4">
                  Select an endpoint from the list to view detailed documentation.
                </p>
                <div className="flex justify-center">
                  <Button
                    onClick={() => copyToClipboard(swaggerJson)}
                    variant="outline"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy OpenAPI JSON'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card isDark={isDark}>
        <div className="flex items-center mb-4">
          <Code className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
          <h2 className="text-lg font-medium">Swagger UI Integration</h2>
        </div>
        <p className="text-sm opacity-70 mb-4">
          The generated API will include Swagger UI for interactive documentation. It will be available at the following endpoint:
        </p>
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} font-mono text-sm mb-6`}>
          http://localhost:{apiConfig.port}/api-docs
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Features</h3>
            <ul className="list-disc ml-4 space-y-1 text-sm opacity-70">
              <li>Interactive API documentation</li>
              <li>Try out API endpoints directly from the browser</li>
              <li>Authentication support</li>
              <li>Request and response examples</li>
              <li>Schema validation</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Implementation</h3>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} font-mono text-xs`}>
              <pre>{`// Swagger UI setup
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

app.use('/api-docs', swaggerUi.serve, 
  swaggerUi.setup(swaggerDocument));`}</pre>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ApiDocumentation;