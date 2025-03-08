import { Node, Edge } from 'reactflow';

export interface Organization {
  id: string;
  name: string;
  domain: string;
  peers: Peer[];
  mspID?: string;
  country?: string;
  state?: string;
  locality?: string;
  type?: string;
}

export interface Peer {
  id: string;
  name: string;
  port: number;
  status: 'pending' | 'running' | 'stopped';
  couchDBPort?: number;
  chaincodePort?: number;
}

export interface Orderer {
  id: string;
  name: string;
  domain: string;
  port: number;
  status: 'pending' | 'running' | 'stopped';
  type: 'solo' | 'etcdraft';
  batchTimeout?: string;
  batchSize?: {
    maxMessageCount: number;
    absoluteMaxBytes: number;
    preferredMaxBytes: number;
  };
}

export interface NetworkConfig {
  organizations: Organization[];
  orderers: Orderer[];
  channelName?: string;
  consortium?: string;
  networkVersion?: string;
  template?: NetworkTemplate;
  stateDatabase?: 'goleveldb' | 'CouchDB';
}

export interface YAMLConfig {
  configtx: string;
  cryptoConfig: string;
  dockerCompose: string;
}

export interface NetworkTemplate {
  id: string;
  name: string;
  description: string;
  channelName: string;
  organizations: {
    name: string;
    type: string;
    peerCount: number;
  }[];
  ordererCount: number;
  stateDatabase: 'goleveldb' | 'CouchDB';
}

export interface Transaction {
  id: string;
  sender: string;
  receiver: string;
  type: string;
  chaincode?: string;
  function?: string;
  args?: string;
  timestamp: number;
  blockHeight: number;
  status: 'pending' | 'committed' | 'failed';
}

export interface Block {
  height: number;
  hash: string;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
}

export interface SimulationState {
  blocks: Block[];
  transactions: Transaction[];
  nodes: Node[];
  edges: Edge[];
  currentBlockHeight: number;
}

export const NETWORK_TEMPLATES: NetworkTemplate[] = [
  {
    id: 'supply-chain',
    name: 'Supply Chain Network',
    description: 'Product movement tracking across the supply chain',
    channelName: 'supplychannel',
    organizations: [
      { name: 'Manufacturer', type: 'manufacturer', peerCount: 2 },
      { name: 'Distributor', type: 'distributor', peerCount: 2 },
      { name: 'Retailer', type: 'retailer', peerCount: 2 }
    ],
    ordererCount: 1,
    stateDatabase: 'CouchDB'
  },
  {
    id: 'financial-services',
    name: 'Financial Services Network',
    description: 'Banking and payment services network',
    channelName: 'paymentschannel',
    organizations: [
      { name: 'Bank A', type: 'bank', peerCount: 2 },
      { name: 'Bank B', type: 'bank', peerCount: 2 },
      { name: 'Clearing House', type: 'clearinghouse', peerCount: 2 }
    ],
    ordererCount: 1,
    stateDatabase: 'CouchDB'
  },
  {
    id: 'healthcare',
    name: 'Healthcare Network',
    description: 'Medical records and data sharing network',
    channelName: 'healthchannel',
    organizations: [
      { name: 'Hospital A', type: 'hospital', peerCount: 2 },
      { name: 'Hospital B', type: 'hospital', peerCount: 2 },
      { name: 'Insurance Provider', type: 'insurance', peerCount: 2 }
    ],
    ordererCount: 1,
    stateDatabase: 'CouchDB'
  },
  {
    id: 'identity-management',
    name: 'Identity Management Network',
    description: 'Government and enterprise identity management',
    channelName: 'identitychannel',
    organizations: [
      { name: 'Government Agency', type: 'government', peerCount: 2 },
      { name: 'Enterprise A', type: 'enterprise', peerCount: 2 },
      { name: 'Enterprise B', type: 'enterprise', peerCount: 2 }
    ],
    ordererCount: 1,
    stateDatabase: 'CouchDB'
  },
  {
    id: 'iot',
    name: 'IoT & Smart Devices Network',
    description: 'IoT device and asset tracking network',
    channelName: 'iotchannel',
    organizations: [
      { name: 'IoT Provider', type: 'provider', peerCount: 2 },
      { name: 'Device Manufacturer', type: 'manufacturer', peerCount: 2 },
      { name: 'Logistics Company', type: 'logistics', peerCount: 2 }
    ],
    ordererCount: 1,
    stateDatabase: 'CouchDB'
  }
];