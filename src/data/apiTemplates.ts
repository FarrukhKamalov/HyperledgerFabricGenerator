import { ApiTemplate } from '../types/api';

export const SUPPLY_CHAIN_TEMPLATE: ApiTemplate = {
  id: 'supply-chain',
  name: 'Supply Chain API',
  description: 'API for tracking assets across the supply chain',
  baseUrl: '/api',
  port: 3000,
  language: 'javascript',
  authType: 'jwt',
  roles: ['admin', 'manufacturer', 'distributor', 'retailer'],
  endpoints: [
    {
      id: crypto.randomUUID(),
      name: 'Create Asset',
      description: 'Create a new asset in the supply chain',
      path: '/assets',
      method: 'POST',
      chaincode: 'supplychain',
      function: 'CreateAsset',
      parameters: [
        { name: 'id', type: 'string', required: true, in: 'body' },
        { name: 'name', type: 'string', required: true, in: 'body' },
        { name: 'description', type: 'string', required: true, in: 'body' },
        { name: 'owner', type: 'string', required: true, in: 'body' },
        { name: 'status', type: 'string', required: true, in: 'body' }
      ],
      responses: {
        '200': { description: 'Asset created successfully' },
        '400': { description: 'Invalid input' },
        '500': { description: 'Internal server error' }
      },
      requiresAuth: true,
      roles: ['admin', 'manufacturer']
    },
    {
      id: crypto.randomUUID(),
      name: 'Get Asset',
      description: 'Retrieve an asset by ID',
      path: '/assets/:id',
      method: 'GET',
      chaincode: 'supplychain',
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
      roles: ['admin', 'manufacturer', 'distributor', 'retailer']
    },
    {
      id: crypto.randomUUID(),
      name: 'Transfer Asset',
      description: 'Transfer asset ownership',
      path: '/assets/:id/transfer',
      method: 'PUT',
      chaincode: 'supplychain',
      function: 'TransferAsset',
      parameters: [
        { name: 'id', type: 'string', required: true, in: 'path' },
        { name: 'newOwner', type: 'string', required: true, in: 'body' }
      ],
      responses: {
        '200': { description: 'Asset transferred successfully' },
        '404': { description: 'Asset not found' },
        '500': { description: 'Internal server error' }
      },
      requiresAuth: true,
      roles: ['admin', 'manufacturer', 'distributor']
    },
    {
      id: crypto.randomUUID(),
      name: 'Update Asset Status',
      description: 'Update the status of an asset',
      path: '/assets/:id/status',
      method: 'PUT',
      chaincode: 'supplychain',
      function: 'UpdateAssetStatus',
      parameters: [
        { name: 'id', type: 'string', required: true, in: 'path' },
        { name: 'status', type: 'string', required: true, in: 'body' }
      ],
      responses: {
        '200': { description: 'Asset status updated successfully' },
        '404': { description: 'Asset not found' },
        '500': { description: 'Internal server error' }
      },
      requiresAuth: true,
      roles: ['admin', 'manufacturer', 'distributor', 'retailer']
    },
    {
      id: crypto.randomUUID(),
      name: 'Get Asset History',
      description: 'Get the transaction history for an asset',
      path: '/assets/:id/history',
      method: 'GET',
      chaincode: 'supplychain',
      function: 'GetAssetHistory',
      parameters: [
        { name: 'id', type: 'string', required: true, in: 'path' }
      ],
      responses: {
        '200': { description: 'Asset history retrieved successfully' },
        '404': { description: 'Asset not found' },
        '500': { description: 'Internal server error' }
      },
      requiresAuth: true,
      roles: ['admin', 'manufacturer', 'distributor', 'retailer']
    }
  ]
};

export const IDENTITY_TEMPLATE: ApiTemplate = {
  id: 'identity',
  name: 'Identity Management API',
  description: 'API for managing digital identities and credentials',
  baseUrl: '/api',
  port: 3000,
  language: 'typescript',
  authType: 'jwt',
  roles: ['admin', 'issuer', 'verifier', 'holder'],
  endpoints: [
    {
      id: crypto.randomUUID(),
      name: 'Create Identity',
      description: 'Create a new digital identity',
      path: '/identities',
      method: 'POST',
      chaincode: 'identity',
      function: 'CreateIdentity',
      parameters: [
        { name: 'id', type: 'string', required: true, in: 'body' },
        { name: 'name', type: 'string', required: true, in: 'body' },
        { name: 'publicKey', type: 'string', required: true, in: 'body' },
        { name: 'metadata', type: 'object', required: false, in: 'body' }
      ],
      responses: {
        '200': { description: 'Identity created successfully' },
        '400': { description: 'Invalid input' },
        '500': { description: 'Internal server error' }
      },
      requiresAuth: true,
      roles: ['admin', 'issuer']
    },
    {
      id: crypto.randomUUID(),
      name: 'Get Identity',
      description: 'Retrieve an identity by ID',
      path: '/identities/:id',
      method: 'GET',
      chaincode: 'identity',
      function: 'ReadIdentity',
      parameters: [
        { name: 'id', type: 'string', required: true, in: 'path' }
      ],
      responses: {
        '200': { description: 'Identity retrieved successfully' },
        '404': { description: 'Identity not found' },
        '500': { description: 'Internal server error' }
      },
      requiresAuth: true,
      roles: ['admin', 'issuer', 'verifier']
    },
    {
      id: crypto.randomUUID(),
      name: 'Issue Credential',
      description: 'Issue a verifiable credential to an identity',
      path: '/credentials',
      method: 'POST',
      chaincode: 'identity',
      function: 'IssueCredential',
      parameters: [
        { name: 'identityId', type: 'string', required: true, in: 'body' },
        { name: 'type', type: 'string', required: true, in: 'body' },
        { name: 'attributes', type: 'object', required: true, in: 'body' },
        { name: 'expirationDate', type: 'string', required: false, in: 'body' }
      ],
      responses: {
        '200': { description: 'Credential issued successfully' },
        '400': { description: 'Invalid input' },
        '404': { description: 'Identity not found' },
        '500': { description: 'Internal server error' }
      },
      requiresAuth: true,
      roles: ['admin', 'issuer']
    },
    {
      id: crypto.randomUUID(),
      name: 'Verify Credential',
      description: 'Verify a credential',
      path: '/credentials/verify',
      method: 'POST',
      chaincode: 'identity',
      function: 'VerifyCredential',
      parameters: [
        { name: 'credentialId', type: 'string', required: true, in: 'body' },
        { name: 'proof', type: 'string', required: true, in: 'body' }
      ],
      responses: {
        '200': { description: 'Credential verified successfully' },
        '400': { description: 'Invalid credential or proof' },
        '500': { description: 'Internal server error' }
      },
      requiresAuth: true,
      roles: ['admin', 'verifier']
    },
    {
      id: crypto.randomUUID(),
      name: 'Revoke Credential',
      description: 'Revoke a previously issued credential',
      path: '/credentials/:id/revoke',
      method: 'PUT',
      chaincode: 'identity',
      function: 'RevokeCredential',
      parameters: [
        { name: 'id', type: 'string', required: true, in: 'path' },
        { name: 'reason', type: 'string', required: false, in: 'body' }
      ],
      responses: {
        '200': { description: 'Credential revoked successfully' },
        '404': { description: 'Credential not found' },
        '500': { description: 'Internal server error' }
      },
      requiresAuth: true,
      roles: ['admin', 'issuer']
    }
  ]
};

export const FINANCIAL_TEMPLATE: ApiTemplate = {
  id: 'financial',
  name: 'Financial Transactions API',
  description: 'API for managing financial transactions and digital assets',
  baseUrl: '/api',
  port: 3000,
  language: 'typescript',
  authType: 'jwt',
  roles: ['admin', 'bank', 'customer'],
  endpoints: [
    {
      id: crypto.randomUUID(),
      name: 'Create Account',
      description: 'Create a new financial account',
      path: '/accounts',
      method: 'POST',
      chaincode: 'financial',
      function: 'CreateAccount',
      parameters: [
        { name: 'id', type: 'string', required: true, in: 'body' },
        { name: 'owner', type: 'string', required: true, in: 'body' },
        { name: 'type', type: 'string', required: true, in: 'body' },
        { name: 'balance', type: 'number', required: true, in: 'body' }
      ],
      responses: {
        '200': { description: 'Account created successfully' },
        '400': { description: 'Invalid input' },
        '500': { description: 'Internal server error' }
      },
      requiresAuth: true,
      roles: ['admin', 'bank']
    },
    {
      id: crypto.randomUUID(),
      name: 'Get Account',
      description: 'Retrieve account details by ID',
      path: '/accounts/:id',
      method: 'GET',
      chaincode: 'financial',
      function: 'ReadAccount',
      parameters: [
        { name: 'id', type: 'string', required: true, in: 'path' }
      ],
      responses: {
        '200': { description: 'Account retrieved successfully' },
        '404': { description: 'Account not found' },
        '500': { description: 'Internal server error' }
      },
      requiresAuth: true,
      roles: ['admin', 'bank', 'customer']
    },
    {
      id: crypto.randomUUID(),
      name: 'Transfer Funds',
      description: 'Transfer funds between accounts',
      path: '/transactions/transfer',
      method: 'POST',
      chaincode: 'financial',
      function: 'TransferFunds',
      parameters: [
        { name: 'fromAccount', type: 'string', required: true, in: 'body' },
        { name: 'toAccount', type: 'string', required: true, in: 'body' },
        { name: 'amount', type: 'number', required: true, in: 'body' },
        { name: 'description', type: 'string', required: false, in: 'body' }
      ],
      responses: {
        '200': { description: 'Funds transferred successfully' },
        '400': { description: 'Invalid input or insufficient funds' },
        '404': { description: 'Account not found' },
        '500': { description: 'Internal server error' }
      },
      requiresAuth: true,
      roles: ['admin', 'bank', 'customer']
    },
    {
      id: crypto.randomUUID(),
      name: 'Get Transaction History',
      description: 'Get transaction history for an account',
      path: '/accounts/:id/transactions',
      method: 'GET',
      chaincode: 'financial',
      function: 'GetTransactionHistory',
      parameters: [
        { name: 'id', type: 'string', required: true, in: 'path' },
        { name: 'startDate', type: 'string', required: false, in: 'query' },
        { name: 'endDate', type: 'string', required: false, in: 'query' }
      ],
      responses: {
        '200': { description: 'Transaction history retrieved successfully' },
        '404': { description: 'Account not found' },
        '500': { description: 'Internal server error' }
      },
      requiresAuth: true,
      roles: ['admin', 'bank', 'customer']
    },
    {
      id: crypto.randomUUID(),
      name: 'Create Escrow',
      description: 'Create an escrow transaction',
      path: '/escrow',
      method: 'POST',
      chaincode: 'financial',
      function: 'CreateEscrow',
      parameters: [
        { name: 'id', type: 'string', required: true, in: 'body' },
        { name: 'fromAccount', type: 'string', required: true, in: 'body' },
        { name: 'toAccount', type: 'string', required: true, in: 'body' },
        { name: 'amount', type: 'number', required: true, in: 'body' },
        { name: 'conditions', type: 'object', required: true, in: 'body' }
      ],
      responses: {
        '200': { description: 'Escrow created successfully' },
        '400': { description: 'Invalid input or insufficient funds' },
        '500': { description: 'Internal server error' }
      },
      requiresAuth: true,
      roles: ['admin', 'bank']
    }
  ]
};