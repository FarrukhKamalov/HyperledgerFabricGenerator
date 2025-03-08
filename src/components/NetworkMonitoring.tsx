import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  RefreshCw, 
  Search, 
  Filter, 
  ChevronRight, 
  ChevronDown,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Cpu,
  HardDrive,
  BarChart4,
  PieChart,
  LineChart,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Layers,
  Hash,
  FileText,
  Users,
  Settings
} from 'lucide-react';

interface NetworkMonitoringProps {
  isDark: boolean;
}

interface Node {
  id: string;
  name: string;
  type: 'peer' | 'orderer';
  organization: string;
  status: 'active' | 'warning' | 'error';
  cpu: number;
  memory: number;
  disk: number;
  transactions: number;
  lastBlock: number;
  uptime: string;
  endpoint: string;
  version: string;
}

interface Block {
  number: number;
  hash: string;
  txCount: number;
  size: number;
  timestamp: number;
  creator: string;
}

interface Transaction {
  id: string;
  type: string;
  channel: string;
  chaincode: string;
  creator: string;
  status: 'active' | 'warning' | 'error';
  timestamp: number;
}

export default function NetworkMonitoring({ isDark }: NetworkMonitoringProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'nodes' | 'blocks' | 'transactions'>('overview');
  const [refreshInterval, setRefreshInterval] = useState<number>(30);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'warning' | 'error'>('all');
  const [filterType, setFilterType] = useState<'all' | 'peer' | 'orderer'>('all');
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Mock data
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 'peer0-org1',
      name: 'peer0.org1.example.com',
      type: 'peer',
      organization: 'Org1',
      status: 'active',
      cpu: 32,
      memory: 45,
      disk: 28,
      transactions: 1245,
      lastBlock: 42,
      uptime: '2d 14h 23m',
      endpoint: 'peer0.org1.example.com:7051',
      version: '2.4.1'
    },
    {
      id: 'peer1-org1',
      name: 'peer1.org1.example.com',
      type: 'peer',
      organization: 'Org1',
      status: 'warning',
      cpu: 78,
      memory: 65,
      disk: 42,
      transactions: 1245,
      lastBlock: 42,
      uptime: '2d 14h 23m',
      endpoint: 'peer1.org1.example.com:8051',
      version: '2.4.1'
    },
    {
      id: 'peer0-org2',
      name: 'peer0.org2.example.com',
      type: 'peer',
      organization: 'Org2',
      status: 'active',
      cpu: 25,
      memory: 38,
      disk: 22,
      transactions: 1245,
      lastBlock: 42,
      uptime: '2d 14h 23m',
      endpoint: 'peer0.org2.example.com:9051',
      version: '2.4.1'
    },
    {
      id: 'peer1-org2',
      name: 'peer1.org2.example.com',
      type: 'peer',
      organization: 'Org2',
      status: 'error',
      cpu: 92,
      memory: 88,
      disk: 95,
      transactions: 1245,
      lastBlock: 42,
      uptime: '2d 14h 23m',
      endpoint: 'peer1.org2.example.com:10051',
      version: '2.4.1'
    },
    {
      id: 'orderer0',
      name: 'orderer0.example.com',
      type: 'orderer',
      organization: 'OrdererOrg',
      status: 'active',
      cpu: 28,
      memory: 42,
      disk: 35,
      transactions: 3456,
      lastBlock: 42,
      uptime: '2d 14h 23m',
      endpoint: 'orderer0.example.com:7050',
      version: '2.4.1'
    },
    {
      id: 'orderer1',
      name: 'orderer1.example.com',
      type: 'orderer',
      organization: 'OrdererOrg',
      status: 'active',
      cpu: 32,
      memory: 45,
      disk: 38,
      transactions: 3456,
      lastBlock: 42,
      uptime: '2d 14h 23m',
      endpoint: 'orderer1.example.com:7050',
      version: '2.4.1'
    },
    {
      id: 'orderer2',
      name: 'orderer2.example.com',
      type: 'orderer',
      organization: 'OrdererOrg',
      status: 'active',
      cpu: 30,
      memory: 40,
      disk: 32,
      transactions: 3456,
      lastBlock: 42,
      uptime: '2d 14h 23m',
      endpoint: 'orderer2.example.com:7050',
      version: '2.4.1'
    }
  ]);
  
  const [blocks, setBlocks] = useState<Block[]>([
    {
      number: 42,
      hash: '8a7d5b37c6e67b9c17bf6f76c3a54e9014d1a11ac17d6f81710a04b8231d1882',
      txCount: 3,
      size: 24.5,
      timestamp: Date.now() - 1000 * 60 * 2,
      creator: 'Org1'
    },
    {
      number: 41,
      hash: '7b6d4c26b5f56a8d06bf5e65b2a43f8903d0a00bb06d5f70609b3b2d7120771',
      txCount: 5,
      size: 32.1,
      timestamp: Date.now() - 1000 * 60 * 5,
      creator: 'Org2'
    },
    {
      number: 40,
      hash: '6c5e3b15a4e45b7f05ae4d54a1b32e7812c0b119a05d4e60508a1a16610660',
      txCount: 2,
      size: 18.7,
      timestamp: Date.now() - 1000 * 60 * 8,
      creator: 'Org1'
    },
    {
      number: 39,
      hash: '5d4c2a04b3d34a6e04ad3c43b0a21d6701b0a008a04c3d50407a0a05500550',
      txCount: 7,
      size: 45.2,
      timestamp: Date.now() - 1000 * 60 * 12,
      creator: 'Org2'
    },
    {
      number: 38,
      hash: '4c3b1903a2c23b5d03bc2b32a0910c5600a0b117903b2c40306909b04400440',
      txCount: 1,
      size: 12.3,
      timestamp: Date.now() - 1000 * 60 * 15,
      creator: 'Org1'
    },
    {
      number: 37,
      hash: '3b2a0802a1b12a4c02ab1a21908f0b4509f0a006802a1b30205808a03300330',
      txCount: 4,
      size: 28.9,
      timestamp: Date.now() - 1000 * 60 * 18,
      creator: 'Org2'
    },
    {
      number: 36,
      hash: '2a1907f190a01b3b01ba0910807e0a3408e09005701a0a20104707902200220',
      txCount: 6,
      size: 38.4,
      timestamp: Date.now() - 1000 * 60 * 22,
      creator: 'Org1'
    }
  ]);
  
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx1234567890abcdef1234567890abcdef',
      type: 'ENDORSER_TRANSACTION',
      channel: 'mychannel',
      chaincode: 'asset-transfer',
      creator: 'Org1Admin',
      status: 'active',
      timestamp: Date.now() - 1000 * 60 * 2
    },
    {
      id: 'tx2345678901abcdef2345678901abcdef',
      type: 'ENDORSER_TRANSACTION',
      channel: 'mychannel',
      chaincode: 'asset-transfer',
      creator: 'Org2Admin',
      status: 'active',
      timestamp: Date.now() - 1000 * 60 * 5
    },
    {
      id: 'tx3456789012abcdef3456789012abcdef',
      type: 'CONFIG_UPDATE',
      channel: 'mychannel',
      chaincode: 'system',
      creator: 'Org1Admin',
      status: 'active',
      timestamp: Date.now() - 1000 * 60 * 8
    },
    {
      id: 'tx4567890123abcdef4567890123abcdef',
      type: 'ENDORSER_TRANSACTION',
      channel: 'mychannel',
      chaincode: 'asset-transfer',
      creator: 'Org2Admin',
      status: 'warning',
      timestamp: Date.now() - 1000 * 60 * 12
    },
    {
      id: 'tx5678901234abcdef5678901234abcdef',
      type: 'ENDORSER_TRANSACTION',
      channel: 'mychannel',
      chaincode: 'asset-transfer',
      creator: 'Org1Admin',
      status: 'active',
      timestamp: Date.now() - 1000 * 60 * 15
    },
    {
      id: 'tx6789012345abcdef6789012345abcdef',
      type: 'ENDORSER_TRANSACTION',
      channel: 'mychannel',
      chaincode: 'asset-transfer',
      creator: 'Org2Admin',
      status: 'error',
      timestamp: Date.now() - 1000 * 60 * 18
    },
    {
      id: 'tx7890123456abcdef7890123456abcdef',
      type: 'CONFIG_UPDATE',
      channel: 'mychannel',
      chaincode: 'system',
      creator: 'Org1Admin',
      status: 'active',
      timestamp: Date.now() - 1000 * 60 * 22
    }
  ]);
  
  // Filter nodes based on search and filters
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = 
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.endpoint.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || node.status === filterStatus;
    const matchesType = filterType === 'all' || node.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  // Toggle node details
  const toggleNodeDetails = (nodeId: string) => {
    if (expandedNode === nodeId) {
      setExpandedNode(null);
    } else {
      setExpandedNode(nodeId);
    }
  };
  
  // Get status color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return isDark 
          ? 'bg-green-900/50 text-green-300' 
          : 'bg-green-100 text-green-800';
      case 'warning':
        return isDark 
          ? 'bg-yellow-900/50 text-yellow-300' 
          : 'bg-yellow-100 text-yellow-800';
      case 'error':
        return isDark 
          ? 'bg-red-900/50 text-red-300' 
          : 'bg-red-100 text-red-800';
      default:
        return isDark 
          ? 'bg-gray-800 text-gray-300' 
          : 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      case 'error':
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };
  
  // Get resource color based on usage percentage
  const getResourceColor = (percentage: number) => {
    if (percentage >= 80) {
      return isDark ? 'text-red-400' : 'text-red-600';
    } else if (percentage >= 60) {
      return isDark ? 'text-yellow-400' : 'text-yellow-600';
    } else {
      return isDark ? 'text-green-400' : 'text-green-600';
    }
  };
  
  // Refresh data
  const refreshData = () => {
    setIsRefreshing(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Update some random values to simulate changes
      const updatedNodes = nodes.map(node => ({
        ...node,
        cpu: Math.min(100, Math.max(10, node.cpu + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5))),
        memory: Math.min(100, Math.max(10, node.memory + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5))),
        disk: Math.min(100, Math.max(10, node.disk + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2))),
        status: Math.random() > 0.9 
          ? (Math.random() > 0.5 ? 'warning' : node.status === 'error' ? 'active' : 'error') 
          : node.status
      }));
      
      // Add a new block
      const newBlock: Block = {
        number: blocks[0].number + 1,
        hash: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        txCount: Math.floor(Math.random() * 10) + 1,
        size: Math.floor(Math.random() * 50) + 10,
        timestamp: Date.now(),
        creator: Math.random() > 0.5 ? 'Org1' : 'Org2'
      };
      
      // Add a new transaction
      const newTransaction: Transaction = {
        id: 'tx' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        type: Math.random() > 0.2 ? 'ENDORSER_TRANSACTION' : 'CONFIG_UPDATE',
        channel: 'mychannel',
        chaincode: Math.random() > 0.2 ? 'asset-transfer' : 'system',
        creator: Math.random() > 0.5 ? 'Org1Admin' : 'Org2Admin',
        status: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'warning' : 'error') : 'active',
        timestamp: Date.now()
      };
      
      setNodes(updatedNodes);
      setBlocks([newBlock, ...blocks.slice(0, -1)]);
      setTransactions([newTransaction, ...transactions.slice(0, -1)]);
      setIsRefreshing(false);
    }, 1000);
  };
  
  // Set up auto-refresh
  useEffect(() => {
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        refreshData();
      }, refreshInterval * 1000);
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval]);
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <nav className={`sticky top-0 z-30 backdrop-blur-md ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center ml-16 md:ml-0">
              <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 text-xl font-semibold">
                Network Monitoring
              </span>
            </div>
            <div className="flex space-x-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Auto-refresh:</span>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                  disabled={!autoRefresh}
                  className={`text-sm rounded-lg ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    !autoRefresh ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="5">5s</option>
                  <option value="10">10s</option>
                  <option value="30">30s</option>
                  <option value="60">60s</option>
                </select>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`p-1 rounded-md ${
                    autoRefresh
                      ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                      : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {autoRefresh ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </button>
              </div>
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg ${
                  isRefreshing ? 'opacity-70 cursor-not-allowed' : ''
                } ${isDark ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white transition-colors duration-200`}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ml-20 md:ml-auto transition-all duration-300">
        {/* Tabs */}
        <div className="flex border-b mb-6 overflow-x-auto">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'overview'
                ? isDark 
                  ? 'border-b-2 border-indigo-500 text-indigo-400'
                  : 'border-b-2 border-indigo-600 text-indigo-700'
                : isDark
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setSelectedTab('nodes')}
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'nodes'
                ? isDark 
                  ? 'border-b-2 border-indigo-500 text-indigo-400'
                  : 'border-b-2 border-indigo-600 text-indigo-700'
                : isDark
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Nodes
          </button>
          <button
            onClick={() => setSelectedTab('blocks')}
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'blocks'
                ? isDark 
                  ? 'border-b-2 border-indigo-500 text-indigo-400'
                  : 'border-b-2 border-indigo-600 text-indigo-700'
                : isDark
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Blocks
          </button>
          <button
            onClick={() => setSelectedTab('transactions')}
            className={`px-4 py-2 text-sm font-medium ${
              selectedTab === 'transactions'
                ? isDark 
                  ? 'border-b-2 border-indigo-500 text-indigo-400'
                  : 'border-b-2 border-indigo-600 text-indigo-700'
                : isDark
                  ? 'text-gray-400 hover:text-gray-300'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Transactions
          </button>
        </div>
        
        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div>
            {/* Network Health */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-70">Network Status</p>
                    <div className="flex items-center mt-1">
                      <div className={`h-3 w-3 rounded-full ${
                        nodes.some(node => node.status === 'error')
                          ? 'bg-red-500'
                          : nodes.some(node => node.status === 'warning')
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                      } mr-2`}></div>
                      <p className="text-xl font-bold">
                        {nodes.some(node => node.status === 'error')
                          ? 'Critical'
                          : nodes.some(node => node.status === 'warning')
                            ? 'Warning'
                            : 'Healthy'}
                      </p>
                    </div>
                  </div>
                  <Activity className={`h-10 w-10 ${
                    nodes.some(node => node.status === 'error')
                      ? isDark ? 'text-red-400 opacity-50' : 'text-red-200'
                      : nodes.some(node => node.status === 'warning')
                        ? isDark ? 'text-yellow-400 opacity-50' : 'text-yellow-200'
                        : isDark ? 'text-green-400 opacity-50' : 'text-green-200'
                  }`} />
                </div>
              </div>
              
              <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-70">Active Nodes</p>
                    <p className="text-xl font-bold mt-1">
                      {nodes.filter(node => node.status === 'active').length}/{nodes.length}
                    </p>
                  </div>
                  <Server className={`h-10 w-10 ${isDark ? 'text-indigo-400 opacity-50' : 'text-indigo-200'}`} />
                </div>
              </div>
              
              <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-70">Latest Block</p>
                    <p className="text-xl font-bold mt-1">#{blocks[0].number}</p>
                  </div>
                  <Layers className={`h-10 w-10 ${isDark ? 'text-purple-400 opacity-50' : 'text-purple-200'}`} />
                </div>
              </div>
              
              <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-70">Transactions (24h)</p>
                    <p className="text-xl font-bold mt-1">1,245</p>
                  </div>
                  <Hash className={`h-10 w-10 ${isDark ? 'text-green-400 opacity-50' : 'text-green-200'}`} />
                </div>
              </div>
            </div>
            
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
                <h2 className="text-lg font-medium mb-4">Resource Usage</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm`}>
                    <div className="flex flex-col items-center">
                      <div className="relative h-16 w-16 mb-2">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-lg font-bold">
                            {Math.round(nodes.reduce((sum, node) => sum + node.cpu, 0) / nodes.length)}%
                          </p>
                        </div>
                        <svg className="h-16 w-16 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            className={`stroke-current ${isDark ? 'text-gray-700' : 'text-gray-200'}`}
                            strokeWidth="10"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className={`stroke-current ${
                              nodes.some(node => node.cpu >= 80)
                                ? isDark ? 'text-red-500' : 'text-red-500'
                                : nodes.some(node => node.cpu >= 60)
                                  ? isDark ? 'text-yellow-500' : 'text-yellow-500'
                                  : isDark ? 'text-green-500' : 'text-green-500'
                            }`}
                            strokeWidth="10"
                            strokeDasharray={`${(Math.round(nodes.reduce((sum, node) => sum + node.cpu, 0) / nodes.length) / 100) * 251.2} 251.2`}
                            strokeLinecap="round"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                      </div>
                      <p className="text-sm opacity-70">CPU</p>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm`}>
                    <div className="flex flex-col items-center">
                      <div className="relative h-16 w-16 mb-2">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-lg font-bold">
                            {Math.round(nodes.reduce((sum, node) => sum + node.memory, 0) / nodes.length)}%
                          </p>
                        </div>
                        <svg className="h-16 w-16 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            className={`stroke-current ${isDark ? 'text-gray-700' : 'text-gray-200'}`}
                            strokeWidth="10" fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className={`stroke-current ${
                              nodes.some(node => node.memory >= 80)
                                ? isDark ? 'text-red-500' : 'text-red-500'
                                : nodes.some(node => node.memory >= 60)
                                  ? isDark ? 'text-yellow-500' : 'text-yellow-500'
                                  : isDark ? 'text-green-500' : 'text-green-500'
                            }`}
                            strokeWidth="10"
                            strokeDasharray={`${(Math.round(nodes.reduce((sum, node) => sum + node.memory, 0) / nodes.length) / 100) * 251.2} 251.2`}
                            strokeLinecap="round"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                      </div>
                      <p className="text-sm opacity-70">Memory</p>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm`}>
                    <div className="flex flex-col items-center">
                      <div className="relative h-16 w-16 mb-2">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <p className="text-lg font-bold">
                            {Math.round(nodes.reduce((sum, node) => sum + node.disk, 0) / nodes.length)}%
                          </p>
                        </div>
                        <svg className="h-16 w-16 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            className={`stroke-current ${isDark ? 'text-gray-700' : 'text-gray-200'}`}
                            strokeWidth="10"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className={`stroke-current ${
                              nodes.some(node => node.disk >= 80)
                                ? isDark ? 'text-red-500' : 'text-red-500'
                                : nodes.some(node => node.disk >= 60)
                                  ? isDark ? 'text-yellow-500' : 'text-yellow-500'
                                  : isDark ? 'text-green-500' : 'text-green-500'
                            }`}
                            strokeWidth="10"
                            strokeDasharray={`${(Math.round(nodes.reduce((sum, node) => sum + node.disk, 0) / nodes.length) / 100) * 251.2} 251.2`}
                            strokeLinecap="round"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                      </div>
                      <p className="text-sm opacity-70">Disk</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Node Status</h3>
                  <div className="space-y-2">
                    {nodes.map((node) => (
                      <div 
                        key={node.id}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
                        } transition-colors duration-200`}
                      >
                        <div className="flex items-center">
                          {node.type === 'peer' ? (
                            <Server className={`h-4 w-4 mr-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                          ) : (
                            <Database className={`h-4 w-4 mr-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                          )}
                          <span className="text-sm">{node.name}</span>
                        </div>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                            {getStatusIcon(node.status)}
                            <span className="capitalize">{node.status}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
                <h2 className="text-lg font-medium mb-4">Network Activity</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs opacity-70">TPS (Avg)</p>
                        <div className="flex items-center mt-1">
                          <p className="text-xl font-bold">12.5</p>
                          <div className="flex items-center ml-2 text-xs text-green-500">
                            <ArrowUpRight className="h-3 w-3 mr-0.5" />
                            <span>4.2%</span>
                          </div>
                        </div>
                      </div>
                      <Zap className={`h-8 w-8 ${isDark ? 'text-yellow-400 opacity-50' : 'text-yellow-200'}`} />
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs opacity-70">Block Time (Avg)</p>
                        <div className="flex items-center mt-1">
                          <p className="text-xl font-bold">2.3s</p>
                          <div className="flex items-center ml-2 text-xs text-red-500">
                            <ArrowDownRight className="h-3 w-3 mr-0.5" />
                            <span>1.8%</span>
                          </div>
                        </div>
                      </div>
                      <Clock className={`h-8 w-8 ${isDark ? 'text-blue-400 opacity-50' : 'text-blue-200'}`} />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium mb-2">Recent Blocks</h3>
                <div className="space-y-2 mb-6">
                  {blocks.slice(0, 5).map((block) => (
                    <div 
                      key={block.hash}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
                      } transition-colors duration-200`}
                    >
                      <div className="flex items-center">
                        <Layers className={`h-4 w-4 mr-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                        <span className="text-sm">#{block.number}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs opacity-70">{block.txCount} txs</span>
                        <span className="text-xs opacity-70">{new Date(block.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <h3 className="text-sm font-medium mb-2">Recent Transactions</h3>
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((tx) => (
                    <div 
                      key={tx.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
                      } transition-colors duration-200`}
                    >
                      <div className="flex items-center">
                        <Hash className={`h-4 w-4 mr-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                        <span className="text-sm font-mono">{tx.id.substring(0, 8)}...</span>
                      </div>
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                          <span className="capitalize">{tx.status}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex justify-end">
                  <button
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md ${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } transition-colors duration-200`}
                  >
                    View All
                  </button>
                </div>
              </div>
            </div>
            
            {/* Organizations and Channels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
                <h2 className="text-lg font-medium mb-4">Organizations</h2>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Users className={`h-5 w-5 mr-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <h3 className="font-medium">Org1</h3>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        nodes.filter(n => n.organization === 'Org1').some(n => n.status === 'error')
                          ? isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                          : isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                      }`}>
                        {nodes.filter(n => n.organization === 'Org1').some(n => n.status === 'error')
                          ? <XCircle className="h-3 w-3 mr-1" />
                          : <CheckCircle className="h-3 w-3 mr-1" />
                        }
                        {nodes.filter(n => n.organization === 'Org1').some(n => n.status === 'error')
                          ? 'Issues'
                          : 'Healthy'
                        }
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <Server className="h-4 w-4 mr-1 opacity-70" />
                        <span>2 Peers</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1 opacity-70" />
                        <span>3 Chaincodes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Users className={`h-5 w-5 mr-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <h3 className="font-medium">Org2</h3>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        nodes.filter(n => n.organization === 'Org2').some(n => n.status === 'error')
                          ? isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                          : isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                      }`}>
                        {nodes.filter(n => n.organization === 'Org2').some(n => n.status === 'error')
                          ? <XCircle className="h-3 w-3 mr-1" />
                          : <CheckCircle className="h-3 w-3 mr-1" />
                        }
                        {nodes.filter(n => n.organization === 'Org2').some(n => n.status === 'error')
                          ? 'Issues'
                          : 'Healthy'
                        }
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <Server className="h-4 w-4 mr-1 opacity-70" />
                        <span>2 Peers</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-1 opacity-70" />
                        <span>3 Chaincodes</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800/50' : 'bg-white'} shadow-sm`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Users className={`h-5 w-5 mr-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        <h3 className="font-medium">OrdererOrg</h3>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        nodes.filter(n => n.organization === 'OrdererOrg').some(n => n.status === 'error')
                          ? isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                          : isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                      }`}>
                        {nodes.filter(n => n.organization === 'OrdererOrg').some(n => n.status === 'error')
                          ? <XCircle className="h-3 w-3 mr-1" />
                          : <CheckCircle className="h-3 w-3 mr-1" />
                        }
                        {nodes.filter(n => n.organization === 'OrdererOrg').some(n => n.status === 'error')
                          ? 'Issues'
                          : 'Healthy'
                        }
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <Database className="h-4 w-4 mr-1 opacity-70" />
                        <span>3 Orderers</span>
                      </div>
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-1 opacity-70" />
                        <span>Raft Consensus</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium">Recent Blocks</h2>
                  <button
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md ${
                      isDark 
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    } transition-colors duration-200`}
                  >
                    View All
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    <thead>
                      <tr>
                        <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                          Block #
                        </th>
                        <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                          Hash
                        </th>
                        <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                          Transactions
                        </th>
                        <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                          Size (KB)
                        </th>
                        <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                      {blocks.slice(0, 5).map((block) => (
                        <tr key={block.hash} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            #{block.number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono opacity-70">
                            {block.hash.substring(0, 12)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                            {block.txCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                            {block.size}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                            {new Date(block.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Nodes Tab */}
        {selectedTab === 'nodes' && (
          <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <h2 className="text-lg font-medium mb-4 md:mb-0">Network Nodes</h2>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search nodes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-9 pr-4 py-2 text-sm rounded-lg ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div className="flex space-x-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className={`pl-2 pr-8 py-2 text-sm rounded-lg ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className={`pl-2 pr-8 py-2 text-sm rounded-lg ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    <option value="all">All Types</option>
                    <option value="peer">Peers</option>
                    <option value="orderer">Orderers</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredNodes.length > 0 ? (
                filteredNodes.map((node) => (
                  <div 
                    key={node.id}
                    className={`border rounded-lg overflow-hidden ${
                      isDark ? 'border-gray-700' : 'border-gray-200'
                    }`}
                  >
                    <div 
                      className={`flex flex-col md:flex-row md:items-center justify-between p-4 cursor-pointer ${
                        isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleNodeDetails(node.id)}
                    >
                      <div className="flex items-center mb-2 md:mb-0">
                        {node.type === 'peer' ? (
                          <Server className={`h-5 w-5 mr-3 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
                        ) : (
                          <Database className={`h-5 w-5 mr-3 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                        )}
                        <div>
                          <div className="font-medium">{node.name}</div>
                          <div className="text-xs opacity-70">{node.organization}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(node.status)}`}>
                          {getStatusIcon(node.status)}
                          <span className="ml-1 capitalize">{node.status}</span>
                        </span>
                        
                        <div className="flex items-center">
                          <Cpu className="h-4 w-4 mr-1 opacity-70" />
                          <span className={`text-xs ${getResourceColor(node.cpu)}`}>{node.cpu}%</span>
                        </div>
                        
                        <div className="flex items-center">
                          <HardDrive className="h-4 w-4 mr-1 opacity-70" />
                          <span className={`text-xs ${getResourceColor(node.memory)}`}>{node.memory}%</span>
                        </div>
                        
                        {expandedNode === node.id ? (
                          <ChevronDown className="h-5 w-5" />
                        ) : (
                          <ChevronRight className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                    
                    {expandedNode === node.id && (
                      <div className={`p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h3 className="text-sm font-medium mb-2">Node Details</h3>
                            <div className="space-y-1 text-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <span className="opacity-70">Type:</span>
                                <span className="capitalize">{node.type}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <span className="opacity-70">Organization:</span>
                                <span>{node.organization}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <span className="opacity-70">Endpoint:</span>
                                <span className="font-mono text-xs">{node.endpoint}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <span className="opacity-70">Version:</span>
                                <span>{node.version}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <span className="opacity-70">Uptime:</span>
                                <span>{node.uptime}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Resource Usage</h3>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between mb-1 text-xs">
                                  <span>CPU</span>
                                  <span className={getResourceColor(node.cpu)}>{node.cpu}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      node.cpu >= 80 ? 'bg-red-500' : node.cpu >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${node.cpu}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-1 text-xs">
                                  <span>Memory</span>
                                  <span className={getResourceColor(node.memory)}>{node.memory}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      node.memory >= 80 ? 'bg-red-500' : node.memory >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${node.memory}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div>
                                <div className="flex justify-between mb-1 text-xs">
                                  <span>Disk</span>
                                  <span className={getResourceColor(node.disk)}>{node.disk}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      node.disk >= 80 ? 'bg-red-500' : node.disk >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${node.disk}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium mb-2">Ledger Status</h3>
                            <div className="space-y-1 text-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <span className="opacity-70">Last Block:</span>
                                <span>#{node.lastBlock}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <span className="opacity-70">Transactions:</span>
                                <span>{node.transactions}</span>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <span className="opacity-70">Channel:</span>
                                <span>mychannel</span>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <button
                                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg ${
                                  isDark 
                                    ? 'bg-indigo-900/50 hover:bg-indigo-800/50 text-indigo-300'
                                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700'
                                } transition-colors duration-200`}
                              >
                                <Settings className="h-3.5 w-3.5 mr-1" />
                                Manage Node
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className={`p-8 text-center rounded-lg ${isDark ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
                  <p className="text-sm opacity-70">No nodes match your filters</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Blocks Tab */}
        {selectedTab === 'blocks' && (
          <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
            <h2 className="text-lg font-medium mb-6">Blockchain Explorer</h2>
            
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead>
                  <tr>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Block #
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Hash
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Transactions
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Size (KB)
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Created By
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {blocks.map((block) => (
                    <tr key={block.hash} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        #{block.number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono opacity-70">
                        {block.hash.substring(0, 12)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                        {block.txCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                        {block.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                        {block.creator}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                        {new Date(block.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm opacity-70">
                Showing {blocks.length} blocks
              </div>
              <div className="flex space-x-2">
                <button
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg ${
                    isDark 
                      ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                  } transition-colors duration-200`}
                  disabled
                >
                  Previous
                </button>
                <button
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg ${
                    isDark 
                      ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                  } transition-colors duration-200`}
                  disabled
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Transactions Tab */}
        {selectedTab === 'transactions' && (
          <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
            <h2 className="text-lg font-medium mb-6">Transaction History</h2>
            
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead>
                  <tr>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Tx ID
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Type
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Channel
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Chaincode
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Creator
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Timestamp
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                        {tx.id.substring(0, 12)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                        {tx.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                        {tx.channel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                        {tx.chaincode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                        {tx.creator}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                          {getStatusIcon(tx.status)}
                          <span className="ml-1">{tx.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                        {new Date(tx.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm opacity-70">
                Showing {transactions.length} transactions
              </div>
              <div className="flex space-x-2">
                <button
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg ${
                    isDark 
                      ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                  } transition-colors duration-200`}
                  disabled
                >
                  Previous
                </button>
                <button
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg ${
                    isDark 
                      ? 'border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300'
                      : 'border-gray-300 bg-white hover:bg-gray-50 text-gray-700'
                  } transition-colors duration-200`}
                  disabled
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}