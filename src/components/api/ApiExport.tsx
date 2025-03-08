import React, { useState } from 'react';
import { Download, Code, FileJson, Archive, Check, Copy } from 'lucide-react';
import Card from '../common/Card';
import Button from '../ui/Button';
import CodeBlock from '../ui/CodeBlock';
import { ApiConfig } from '../../types/api';

interface ApiExportProps {
  apiConfig: ApiConfig;
  isDark: boolean;
}

const ApiExport: React.FC<ApiExportProps> = ({ apiConfig, isDark }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'js' | 'ts' | 'docker'>('js');
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generatePackageJson = () => {
    const dependencies = {
      "express": "^4.18.2",
      "cors": "^2.8.5",
      "helmet": "^7.0.0",
      "morgan": "^1.10.0",
      "fabric-network": "^2.2.18",
      "swagger-ui-express": "^5.0.0",
      "winston": "^3.10.0"
    };

    // Add auth dependencies if needed
    if (apiConfig.authType === 'jwt') {
      Object.assign(dependencies, {
        "jsonwebtoken": "^9.0.1",
        "bcrypt": "^5.1.0",
        "express-validator": "^7.0.1"
      });
    } else if (apiConfig.authType === 'apikey') {
      Object.assign(dependencies, {
        "uuid": "^9.0.0",
        "express-rate-limit": "^6.9.0"
      });
    }

    // Add TypeScript dependencies if needed
    const devDependencies = apiConfig.language === 'typescript' 
      ? {
          "typescript": "^5.1.6",
          "@types/express": "^4.17.17",
          "@types/cors": "^2.8.13",
          "@types/morgan": "^1.9.4",
          "@types/node": "^20.4.5",
          "ts-node": "^10.9.1",
          "nodemon": "^3.0.1"
        }
      : {
          "nodemon": "^3.0.1"
        };

    // Add auth type dependencies
    if (apiConfig.language === 'typescript' && apiConfig.authType === 'jwt') {
      Object.assign(devDependencies, {
        "@types/jsonwebtoken": "^9.0.2",
        "@types/bcrypt": "^5.0.0"
      });
    }

    const packageJson = {
      "name": apiConfig.name.toLowerCase().replace(/\s+/g, '-'),
      "version": apiConfig.version,
      "description": apiConfig.description,
      "main": apiConfig.language === 'typescript' ? "dist/index.js" : "src/index.js",
      "scripts": {
        "start": apiConfig.language === 'typescript' ? "node dist/index.js" : "node src/index.js",
        "dev": apiConfig.language === 'typescript' 
          ? "nodemon --exec ts-node src/index.ts" 
          : "nodemon src/index.js",
        "build": apiConfig.language === 'typescript' ? "tsc" : "echo 'No build step needed'"
      },
      "dependencies": dependencies,
      "devDependencies": devDependencies
    };

    return JSON.stringify(packageJson, null, 2);
  };

  const generateServerCode = () => {
    if (apiConfig.language === 'typescript') {
      return `import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { Gateway, Wallets } from 'fabric-network';
import fs from 'fs';
import path from 'path';
import winston from 'winston';

// Import routes
import apiRoutes from './routes';
${apiConfig.authType !== 'none' ? `import authRoutes from './routes/auth';` : ''}

// Import middleware
${apiConfig.authType !== 'none' ? `import { authenticateToken } from './middleware/auth';` : ''}

// Import swagger document
import swaggerDocument from './swagger.json';

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || ${apiConfig.port};

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
${apiConfig.authType !== 'none' ? `app.use('${apiConfig.baseUrl}/auth', authRoutes);` : ''}
app.use('${apiConfig.baseUrl}', ${apiConfig.authType !== 'none' ? 'authenticateToken, ' : ''}apiRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(\`\${err.message}\`);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(\`Server running on port \${PORT}\`);
  console.log(\`Server running on port \${PORT}\`);
  console.log(\`API Documentation: http://localhost:\${PORT}/api-docs\`);
});

export default app;`;
    } else {
      return `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Import routes
const apiRoutes = require('./routes');
${apiConfig.authType !== 'none' ? `const authRoutes = require('./routes/auth');` : ''}

// Import middleware
${apiConfig.authType !== 'none' ? `const { authenticateToken } = require('./middleware/auth');` : ''}

// Import swagger document
const swaggerDocument = require('./swagger.json');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Initialize Express app
const app = express();
const PORT = process.env.PORT || ${apiConfig.port};

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
${apiConfig.authType !== 'none' ? `app.use('${apiConfig.baseUrl}/auth', authRoutes);` : ''}
app.use('${apiConfig.baseUrl}', ${apiConfig.authType !== 'none' ? 'authenticateToken, ' : ''}apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(\`\${err.message}\`);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(\`Server running on port \${PORT}\`);
  console.log(\`Server running on port \${PORT}\`);
  console.log(\`API Documentation: http://localhost:\${PORT}/api-docs\`);
});

module.exports = app;`;
    }
  };

  const generateAuthMiddleware = () => {
    if (apiConfig.authType === 'jwt') {
      return apiConfig.language === 'typescript' 
        ? `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  roles: string[];
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
};

export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const hasRole = req.user.roles.some(role => roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};`
        : `const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
};

const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }

    const hasRole = req.user.roles.some(role => roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };`;
    } else if (apiConfig.authType === 'apikey') {
      return apiConfig.language === 'typescript'
        ? `import { Request, Response, NextFunction } from 'express';
import { getApiKey } from '../services/apiKeyService';

// Extend Express Request type to include apiKey
declare global {
  namespace Express {
    interface Request {
      apiKey?: {
        id: string;
        roles: string[];
      };
    }
  }
}

export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({ error: 'Unauthorized: No API key provided' });
  }

  try {
    // In a real implementation, this would validate against a database
    const keyData = await getApiKey(apiKey);
    
    if (!keyData) {
      return res.status(403).json({ error: 'Forbidden: Invalid API key' });
    }
    
    req.apiKey = keyData;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const authorizeRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.apiKey) {
      return res.status(401).json({ error: 'Unauthorized: API key not authenticated' });
    }

    const hasRole = req.apiKey.roles.some(role => roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};`
        : `const { getApiKey } = require('../services/apiKeyService');

const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ error: 'Unauthorized: No API key provided' });
  }

  try {
    // In a real implementation, this would validate against a database
    const keyData = await getApiKey(apiKey);
    
    if (!keyData) {
      return res.status(403).json({ error: 'Forbidden: Invalid API key' });
    }
    
    req.apiKey = keyData;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!req.apiKey) {
      return res.status(401).json({ error: 'Unauthorized: API key not authenticated' });
    }

    const hasRole = req.apiKey.roles.some(role => roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }

    next();
  };
};

module.exports = { authenticateApiKey, authorizeRoles };`;
    }
    
    return "// No authentication middleware required";
  };

  const generateDockerfile = () => {
    return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

${apiConfig.language === 'typescript' ? 'RUN npm run build' : ''}

EXPOSE ${apiConfig.port}

CMD ["npm", "start"]`;
  };

  const generateDockerCompose = () => {
    return `version: '3'

services:
  api:
    build: .
    ports:
      - "${apiConfig.port}:${apiConfig.port}"
    environment:
      - NODE_ENV=production
      - PORT=${apiConfig.port}
      ${apiConfig.authType === 'jwt' ? '- JWT_SECRET=your-secret-key' : ''}
    volumes:
      - ./wallet:/app/wallet
      - ./connection-profile.json:/app/connection-profile.json
    networks:
      - fabric-network

networks:
  fabric-network:
    external: true`;
  };

  const generateReadme = () => {
    return `# ${apiConfig.name}

${apiConfig.description}

## API Version

${apiConfig.version}

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Hyperledger Fabric network

### Installation

1. Clone this repository
2. Install dependencies:

\`\`\`bash
npm install
\`\`\`

3. Configure your Fabric connection profile in \`connection-profile.json\`

### Running the API

Development mode:

\`\`\`bash
npm run dev
\`\`\`

Production mode:

\`\`\`bash
${apiConfig.language === 'typescript' ? 'npm run build' : ''}
npm start
\`\`\`

## API Documentation

API documentation is available at:

\`\`\`
http://localhost:${apiConfig.port}/api-docs
\`\`\`

## Authentication

${apiConfig.authType === 'jwt' 
  ? 'This API uses JWT authentication. To access protected endpoints, include a Bearer token in the Authorization header.'
  : apiConfig.authType === 'apikey'
  ? 'This API uses API Key authentication. To access protected endpoints, include your API key in the X-API-Key header.'
  : 'This API does not require authentication.'}

## Docker Deployment

Build and run with Docker:

\`\`\`bash
docker build -t ${apiConfig.name.toLowerCase().replace(/\s+/g, '-')} .
docker run -p ${apiConfig.port}:${apiConfig.port} ${apiConfig.name.toLowerCase().replace(/\s+/g, '-')}
\`\`\`

Or use Docker Compose:

\`\`\`bash
docker-compose up -d
\`\`\`

## License

MIT
`;
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

  const downloadProject = () => {
    // In a real implementation, this would create a zip file with all the generated files
    alert('This would download a complete project with all the generated files.');
  };

  return (
    <div className="space-y-6">
      <Card isDark={isDark}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Download className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-lg font-medium">Export API Project</h2>
          </div>
          <Button
            onClick={downloadProject}
            variant="primary"
            icon={Archive}
          >
            Download Complete Project
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex space-x-2 mb-4">
            <Button
              onClick={() => setActiveTab('js')}
              variant={activeTab === 'js' ? 'primary' : 'outline'}
            >
              JavaScript
            </Button>
            <Button
              onClick={() => setActiveTab('ts')}
              variant={activeTab === 'ts' ? 'primary' : 'outline'}
            >
              TypeScript
            </Button>
            <Button
              onClick={() => setActiveTab('docker')}
              variant={activeTab === 'docker' ? 'primary' : 'outline'}
            >
              Docker
            </Button>
          </div>

          {activeTab === 'js' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">package.json</h3>
                  <Button
                    onClick={() => copyToClipboard(generatePackageJson())}
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <CodeBlock
                  code={generatePackageJson()}
                  language="json"
                  isDark={isDark}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">src/index.js</h3>
                  <Button
                    onClick={() => copyToClipboard(generateServerCode())}
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <CodeBlock
                  code={generateServerCode()}
                  language="javascript"
                  isDark={isDark}
                />
              </div>

              {apiConfig.authType !== 'none' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">src/middleware/auth.js</h3>
                    <Button
                      onClick={() => copyToClipboard(generateAuthMiddleware())}
                      variant="outline"
                      size="sm"
                      icon={copied ? Check : Copy}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <CodeBlock
                    code={generateAuthMiddleware()}
                    language="javascript"
                    isDark={isDark}
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">swagger.json</h3>
                  <Button
                    onClick={() => copyToClipboard(generateSwaggerJson())}
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <CodeBlock
                  code={generateSwaggerJson()}
                  language="json"
                  isDark={isDark}
                />
              </div>
            </div>
          )}

          {activeTab === 'ts' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">package.json (TypeScript)</h3>
                  <Button
                    onClick={() => copyToClipboard(generatePackageJson())}
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <CodeBlock
                  code={generatePackageJson()}
                  language="json"
                  isDark={isDark}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">src/index.ts</h3>
                  <Button
                    onClick={() => copyToClipboard(generateServerCode())}
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <CodeBlock
                  code={generateServerCode()}
                  language="typescript"
                  isDark={isDark}
                />
              </div>

              {apiConfig.authType !== 'none' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium">src/middleware/auth.ts</h3>
                    <Button
                      onClick={() => copyToClipboard(generateAuthMiddleware())}
                      variant="outline"
                      size="sm"
                      icon={copied ? Check : Copy}
                    >
                      {copied ? 'Copied' : 'Copy'}
                    </Button>
                  </div>
                  <CodeBlock
                    code={generateAuthMiddleware()}
                    language="typescript"
                    isDark={isDark}
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">tsconfig.json</h3>
                  <Button
                    onClick={() => copyToClipboard(`{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}`)}
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <CodeBlock
                  code={`{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}`}
                  language="json"
                  isDark={isDark}
                />
              </div>
            </div>
          )}

          {activeTab === 'docker' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Dockerfile</h3>
                  <Button
                    onClick={() => copyToClipboard(generateDockerfile())}
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <CodeBlock
                  code={generateDockerfile()}
                  language="dockerfile"
                  isDark={isDark}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">docker-compose.yml</h3>
                  <Button
                    onClick={() => copyToClipboard(generateDockerCompose())}
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <CodeBlock
                  code={generateDockerCompose()}
                  language="yaml"
                  isDark={isDark}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">README.md</h3>
                  <Button
                    onClick={() => copyToClipboard(generateReadme())}
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <CodeBlock
                  code={generateReadme()}
                  language="markdown"
                  isDark={isDark}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Project Structure</h3>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'} font-mono text-xs`}>
              <pre>{`${apiConfig.name.toLowerCase().replace(/\s+/g, '-')}/
├── src/
│   ├── index.${apiConfig.language === 'typescript' ? 'ts' : 'js'}
│   ├── routes/
│   │   ├── index.${apiConfig.language === 'typescript' ? 'ts' : 'js'}
${apiConfig.authType !== 'none' ? `│   │   └── auth.${apiConfig.language === 'typescript' ? 'ts' : 'js'}\n` : ''}│   ├── controllers/
│   │   └── api.${apiConfig.language === 'typescript' ? 'ts' : 'js'}
${apiConfig.authType !== 'none' ? `│   ├── middleware/\n│   │   └── auth.${apiConfig.language === 'typescript' ? 'ts' : 'js'}\n` : ''}│   ├── services/
│   │   └── fabric.${apiConfig.language === 'typescript' ? 'ts' : 'js'}
${apiConfig.language === 'typescript' ? '│   └── types/\n│       └── index.ts\n' : ''}├── swagger.json
├── package.json
${apiConfig.language === 'typescript' ? '├── tsconfig.json\n' : ''}├── Dockerfile
├── docker-compose.yml
└── README.md`}</pre>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Deployment Options</h3>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <Code className="h-4 w-4 mr-2 mt-1 text-green-500" />
                  <span>
                    <strong>Local Development:</strong> Run with npm run dev for hot reloading
                  </span>
                </li>
                <li className="flex items-start">
                  <Archive className="h-4 w-4 mr-2 mt-1 text-blue-500" />
                  <span>
                    <strong>Docker Container:</strong> Build and run with Docker for isolated deployment
                  </span>
                </li>
                <li className="flex items-start">
                  <FileJson className="h-4 w-4 mr-2 mt-1 text-purple-500" />
                  <span>
                    <strong>Cloud Deployment:</strong> Deploy to any Node.js-compatible cloud service
                  </span>
                </li>
                <li className="flex items-start">
                  <Download className="h-4 w-4 mr-2 mt-1 text-indigo-500" />
                  <span>
                    <strong>Download Project:</strong> Get the complete project as a ZIP file
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ApiExport;