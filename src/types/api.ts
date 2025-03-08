export interface Parameter {
  name: string;
  type: string;
  required: boolean;
  in: 'query' | 'path' | 'body' | 'header';
}

export interface ApiResponse {
  description: string;
}

export interface ApiEndpoint {
  id: string;
  name: string;
  description: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  chaincode?: string;
  function?: string;
  parameters: Parameter[];
  responses: Record<string, ApiResponse>;
  requiresAuth: boolean;
  roles: string[];
}

export type AuthType = 'jwt' | 'apikey' | 'none';

export interface ApiConfig {
  name: string;
  version: string;
  description: string;
  baseUrl: string;
  port: number;
  endpoints: ApiEndpoint[];
  authType: AuthType;
  roles: string[];
  language: 'javascript' | 'typescript';
}

export interface ApiTemplate {
  id: string;
  name: string;
  description: string;
  baseUrl: string;
  port: number;
  endpoints: ApiEndpoint[];
  authType: AuthType;
  roles: string[];
  language: 'javascript' | 'typescript';
}