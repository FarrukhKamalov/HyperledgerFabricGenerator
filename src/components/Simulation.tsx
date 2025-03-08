import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  Activity, 
  Play, 
  RotateCcw, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  Clock,
  ZoomIn,
  ZoomOut,
  Maximize,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Filter,
  Search,
  BarChart4,
  PieChart,
  LineChart,
  ArrowRight,
  Zap,
  Settings,
  Layers,
  Eye,
  EyeOff,
  Code,
  FileCode,
  Server,
  Database,
  HardDrive
} from 'lucide-react';
import type { Transaction, Block, SimulationState } from '../types';
import { generateHash } from '../utils/cryptoUtils';

interface SimulationProps {
  isDark: boolean;
}

const initialState: SimulationState = {
  blocks: [],
  transactions: [],
  nodes: [],
  edges: [],
  currentBlockHeight: 0,
};

const transactionTypes = [
  'Asset Transfer',
  'Smart Contract Deploy',
  'Smart Contract Invoke',
  'Configuration Update',
  'Channel Create',
];

const chaincodeTypes = [
  'Asset Management',
  'Token Contract',
  'Supply Chain',
  'Voting System',
  'Identity Management'
];

const CustomNode = ({ data }: { data: any }) => (
  <div className={`px-4 py-3 shadow-lg rounded-lg network-node ${data.className}`}>
    <div className="flex items-center">
      {data.icon}
      <div className="ml-2">
        <div className="text-sm font-bold">{data.label}</div>
        {data.details && <div className="text-xs opacity-70">{data.details}</div>}
      </div>
    </div>
  </div>
);

const nodeTypes = {
  custom: CustomNode,
};

export default function Simulation({ isDark }: SimulationProps) {
  const [state, setState] = useState<SimulationState>(initialState);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [newTransaction, setNewTransaction] = useState({
    sender: '',
    receiver: '',
    type: transactionTypes[0],
    chaincode: chaincodeTypes[0],
    function: 'createAsset',
    args: 'asset1, blue, 5, Tomoko, 300'
  });
  const [simulationStatus, setSimulationStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTransactionDetails, setShowTransactionDetails] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'committed' | 'failed'>('all');
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<'basic' | 'flow'>('basic');
  const [showLedger, setShowLedger] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(2000);
  const [showChaincodeFlow, setShowChaincodeFlow] = useState(true);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [showExecutionLogs, setShowExecutionLogs] = useState(false);
  const [activePhase, setActivePhase] = useState<string | null>(null);
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs to bottom when new logs are added
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [executionLogs]);

  const resetSimulation = () => {
    setIsLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      setState(initialState);
      initializeNodes();
      setSimulationStatus('');
      setIsLoading(false);
      setExecutionLogs([]);
      setActivePhase(null);
    }, 800);
  };

  const createBlock = (transactions: Transaction[]): Block => {
    const previousBlock = state.blocks[state.blocks.length - 1];
    const height = state.currentBlockHeight + 1;
    const timestamp = Date.now();
    const previousHash = previousBlock?.hash || '0'.repeat(64);
    const blockData = `${height}${previousHash}${timestamp}${JSON.stringify(transactions)}`;
    const hash = generateHash(blockData);

    return {
      height,
      hash,
      timestamp,
      transactions,
      previousHash,
    };
  };

  const addExecutionLog = (log: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLogs(prev => [...prev, `[${timestamp}] ${log}`]);
  };

  const simulateTransactionFlow = async (transaction: Transaction) => {
    // Phase 1: Proposal
    setActivePhase('proposal');
    addExecutionLog(`Starting transaction flow for ${transaction.id.substring(0, 8)}...`);
    addExecutionLog(`Phase 1: Client submits transaction proposal to endorsing peers`);
    
    const proposalEdges = [
      {
        id: `proposal-${transaction.id}`,
        source: transaction.sender,
        target: `${transaction.sender}-peer0`,
        animated: true,
        style: { stroke: isDark ? '#60A5FA' : '#3B82F6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: `proposal-backup-${transaction.id}`,
        source: transaction.sender,
        target: `${transaction.sender}-peer1`,
        animated: true,
        style: { stroke: isDark ? '#60A5FA' : '#3B82F6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ];
    
    setSimulationStatus("1. Client submits transaction proposal");
    setEdges(prev => [...prev, ...proposalEdges]);
    await new Promise(resolve => setTimeout(resolve, simulationSpeed));
    
    if (showChaincodeFlow) {
      // Chaincode execution on peers
      addExecutionLog(`Chaincode ${transaction.chaincode} executing on endorsing peers`);
      addExecutionLog(`Function: ${transaction.function}(${transaction.args})`);
      
      // Highlight chaincode nodes
      const chaincodeEdges = [
        {
          id: `chaincode-exec1-${transaction.id}`,
          source: `${transaction.sender}-peer0`,
          target: `chaincode-${transaction.sender}`,
          animated: true,
          style: { stroke: isDark ? '#34D399' : '#10B981', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
          id: `chaincode-exec2-${transaction.id}`,
          source: `${transaction.sender}-peer1`,
          target: `chaincode-${transaction.sender}`,
          animated: true,
          style: { stroke: isDark ? '#34D399' : '#10B981', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed },
        }
      ];
      
      setEdges(prev => [...prev.filter(e => !proposalEdges.find(pe => pe.id === e.id)), ...chaincodeEdges]);
      await new Promise(resolve => setTimeout(resolve, simulationSpeed));
      setEdges(prev => prev.filter(edge => !chaincodeEdges.find(e => e.id === edge.id)));
    }

    // Phase 2: Endorsement
    setActivePhase('endorsement');
    addExecutionLog(`Phase 2: Peers execute transaction and return endorsement`);
    
    const endorsementEdges = [
      {
        id: `endorsement-${transaction.id}`,
        source: `${transaction.sender}-peer0`,
        target: transaction.sender,
        animated: true,
        style: { stroke: isDark ? '#34D399' : '#10B981', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: `endorsement-backup-${transaction.id}`,
        source: `${transaction.sender}-peer1`,
        target: transaction.sender,
        animated: true,
        style: { stroke: isDark ? '#34D399' : '#10B981', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ];
    
    setSimulationStatus("2. Peers execute transaction and return endorsement");
    setEdges(prev => [...prev.filter(e => !proposalEdges.find(pe => pe.id === e.id)), ...endorsementEdges]);
    await new Promise(resolve => setTimeout(resolve, simulationSpeed));

    // Phase 3: Ordering
    setActivePhase('ordering');
    addExecutionLog(`Phase 3: Client sends endorsed transaction to orderer`);
    
    const orderingEdges = [
      {
        id: `ordering-${transaction.id}`,
        source: transaction.sender,
        target: 'orderer1',
        animated: true,
        style: { stroke: isDark ? '#F472B6' : '#EC4899', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ];
    
    setSimulationStatus("3. Client sends endorsed transaction to orderer");
    setEdges(prev => [...prev.filter(e => !endorsementEdges.find(pe => pe.id === e.id)), ...orderingEdges]);
    await new Promise(resolve => setTimeout(resolve, simulationSpeed));

    // Phase 4: Distribution
    setActivePhase('distribution');
    addExecutionLog(`Phase 4: Orderer creates block and distributes to all peers`);
    addExecutionLog(`Block #${state.currentBlockHeight + 1} created with transaction ${transaction.id.substring(0, 8)}`);
    
    const distributionEdges = [
      {
        id: `distribution-1-${transaction.id}`,
        source: 'orderer1',
        target: `${transaction.sender}-peer0`,
        animated: true,
        style: { stroke: isDark ? '#A78BFA' : '#8B5CF6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: `distribution-2-${transaction.id}`,
        source: 'orderer1',
        target: `${transaction.sender}-peer1`,
        animated: true,
        style: { stroke: isDark ? '#A78BFA' : '#8B5CF6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: `distribution-3-${transaction.id}`,
        source: 'orderer1',
        target: `${transaction.receiver}-peer0`,
        animated: true,
        style: { stroke: isDark ? '#A78BFA' : '#8B5CF6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: `distribution-4-${transaction.id}`,
        source: 'orderer1',
        target: `${transaction.receiver}-peer1`,
        animated: true,
        style: { stroke: isDark ? '#A78BFA' : '#8B5CF6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ];
    
    setSimulationStatus("4. Orderer creates block and distributes to all peers");
    setEdges(prev => [...prev.filter(e => !orderingEdges.find(pe => pe.id === e.id)), ...distributionEdges]);
    await new Promise(resolve => setTimeout(resolve, simulationSpeed));

    // Phase 5: Validation and Commit
    setActivePhase('commit');
    addExecutionLog(`Phase 5: Peers validate and commit block to their ledger`);
    
    let ledgerEdges = [];
    if (showLedger) {
      ledgerEdges = [
        {
          id: `ledger-1-${transaction.id}`,
          source: `${transaction.sender}-peer0`,
          target: `ledger-${transaction.sender}`,
          animated: true,
          style: { stroke: isDark ? '#FBBF24' : '#F59E0B', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
          id: `ledger-2-${transaction.id}`,
          source: `${transaction.sender}-peer1`,
          target: `ledger-${transaction.sender}`,
          animated: true,
          style: { stroke: isDark ? '#FBBF24' : '#F59E0B', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
          id: `ledger-3-${transaction.id}`,
          source: `${transaction.receiver}-peer0`,
          target: `ledger-${transaction.receiver}`,
          animated: true,
          style: { stroke: isDark ? '#FBBF24' : '#F59E0B', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
        },
        {
          id: `ledger-4-${transaction.id}`,
          source: `${transaction.receiver}-peer1`,
          target: `ledger-${transaction.receiver}`,
          animated: true,
          style: { stroke: isDark ? '#FBBF24' : '#F59E0B', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed },
        },
      ];
    }
    
    const commitEdges = [
      {
        id: `commit-${transaction.id}`,
        source: transaction.sender,
        target: transaction.receiver,
        animated: true,
        style: { stroke: isDark ? '#10B981' : '#059669', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      ...ledgerEdges
    ];
    
    setSimulationStatus("5. Peers validate and commit block to their ledger");
    setEdges(prev => [...prev.filter(e => !distributionEdges.find(pe => pe.id === e.id)), ...commitEdges]);
    await new Promise(resolve => setTimeout(resolve, simulationSpeed));

    // Transaction completed
    setActivePhase('completed');
    setSimulationStatus('Transaction completed successfully');
    addExecutionLog(`Transaction ${transaction.id.substring(0, 8)} completed successfully`);
    
    const finalEdge = {
      id: `final-${transaction.id}`,
      source: transaction.sender,
      target: transaction.receiver,
      style: { stroke: isDark ? '#10B981' : '#059669', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed },
    };

    setEdges(prev => [...prev.filter(e => !commitEdges.find(pe => pe.id === e.id)), finalEdge]);
  };

  const submitTransaction = () => {
    if (!newTransaction.sender || !newTransaction.receiver) {
      return;
    }

    setIsLoading(true);
    
    // Simulate loading
    setTimeout(() => {
      const transaction: Transaction = {
        id: generateHash(Date.now().toString()),
        sender: newTransaction.sender,
        receiver: newTransaction.receiver,
        type: newTransaction.type,
        chaincode: newTransaction.chaincode,
        function: newTransaction.function,
        args: newTransaction.args,
        timestamp: Date.now(),
        blockHeight: state.currentBlockHeight + 1,
        status: 'pending',
      };

      setState(prev => ({
        ...prev,
        transactions: [...prev.transactions, transaction],
      }));

      simulateTransactionFlow(transaction).then(() => {
        const block = createBlock([transaction]);
        setState(prev => ({
          ...prev,
          blocks: [...prev.blocks, block],
          transactions: prev.transactions.map(tx =>
            tx.id === transaction.id ? { ...tx, status: 'committed' } : tx
          ),
          currentBlockHeight: prev.currentBlockHeight + 1,
        }));
      });

      setNewTransaction({
        sender: '',
        receiver: '',
        type: transactionTypes[0],
        chaincode: chaincodeTypes[0],
        function: 'createAsset',
        args: 'asset1, blue, 5, Tomoko, 300'
      });
      
      setIsLoading(false);
    }, 500);
  };

  // Initialize network nodes
  const initializeNodes = useCallback(() => {
    const initialNodes: Node[] = [
      // Organizations
      {
        id: 'org1',
        type: 'custom',
        position: { x: 100, y: 100 },
        data: {
          label: 'Organization 1',
          className: isDark 
            ? 'bg-indigo-900/40 border-2 border-indigo-700 text-white backdrop-blur-sm'
            : 'bg-indigo-50 border-2 border-indigo-200 text-indigo-900',
          icon: <div className="w-4 h-4 rounded-full bg-indigo-500" />,
        },
      },
      {
        id: 'org2',
        type: 'custom',
        position: { x: 500, y: 100 },
        data: {
          label: 'Organization 2',
          className: isDark 
            ? 'bg-indigo-900/40 border-2 border-indigo-700 text-white backdrop-blur-sm'
            : 'bg-indigo-50 border-2 border-indigo-200 text-indigo-900',
          icon: <div className="w-4 h-4 rounded-full bg-indigo-500" />,
        },
      },
      // Peers for Org1
      {
        id: 'org1-peer0',
        type: 'custom',
        position: { x: 50, y: 250 },
        data: {
          label: 'Peer 0',
          details: 'Organization 1',
          className: isDark 
            ? 'bg-green-900/40 border-2 border-green-700 text-white backdrop-blur-sm'
            : 'bg-green-50 border-2 border-green-200 text-green-900',
          icon: <Server className="h-4 w-4 text-green-500" />,
        },
      },
      {
        id: 'org1-peer1',
        type: 'custom',
        position: { x: 150, y: 250 },
        data: {
          label: 'Peer 1',
          details: 'Organization 1',
          className: isDark 
            ? 'bg-green-900/40 border-2 border-green-700 text-white backdrop-blur-sm'
            : 'bg-green-50 border-2 border-green-200 text-green-900',
          icon: <Server className="h-4 w-4 text-green-500" />,
        },
      },
      // Peers for Org2
      {
        id: 'org2-peer0',
        type: 'custom',
        position: { x: 450, y: 250 },
        data: {
          label: 'Peer 0',
          details: 'Organization 2',
          className: isDark 
            ? 'bg-green-900/40 border-2 border-green-700 text-white backdrop-blur-sm'
            : 'bg-green-50 border-2 border-green-200 text-green-900',
          icon: <Server className="h-4 w-4 text-green-500" />,
        },
      },
      {
        id: 'org2-peer1',
        type: 'custom',
        position: { x: 550, y: 250 },
        data: {
          label: 'Peer 1',
          details: 'Organization 2',
          className: isDark 
            ? 'bg-green-900/40 border-2 border-green-700 text-white backdrop-blur-sm'
            : 'bg-green-50 border-2 border-green-200 text-green-900',
          icon: <Server className="h-4 w-4 text-green-500" />,
        },
      },
      // Orderer
      {
        id: 'orderer1',
        type: 'custom',
        position: { x: 300, y: 400 },
        data: {
          label: 'Orderer',
          className: isDark 
            ? 'bg-purple-900/40 border-2 border-purple-700 text-white backdrop-blur-sm'
            : 'bg-purple-50 border-2 border-purple-200 text-purple-900',
          icon: <HardDrive className="h-4 w-4 text-purple-500" />,
        },
      },
    ];

    // Add chaincode nodes
    if (showChaincodeFlow) {
      initialNodes.push(
        {
          id: 'chaincode-org1',
          type: 'custom',
          position: { x: 100, y: 350 },
          data: {
            label: 'Chaincode',
            details: 'Organization 1',
            className: isDark 
              ? 'bg-blue-900/40 border-2 border-blue-700 text-white backdrop-blur-sm'
              : 'bg-blue-50 border-2 border-blue-200 text-blue-900',
            icon: <Code className="h-4 w-4 text-blue-500" />,
          },
        },
        {
          id: 'chaincode-org2',
          type: 'custom',
          position: { x: 500, y: 350 },
          data: {
            label: 'Chaincode',
            details: 'Organization 2',
            className: isDark 
              ? 'bg-blue-900/40 border-2 border-blue-700 text-white backdrop-blur-sm'
              : 'bg-blue-50 border-2 border-blue-200 text-blue-900',
            icon: <Code className="h-4 w-4 text-blue-500" />,
          },
        }
      );
    }

    // Add ledger nodes if enabled
    if (showLedger) {
      initialNodes.push(
        {
          id: 'ledger-org1',
          type: 'custom',
          position: { x: 100, y: 450 },
          data: {
            label: 'Ledger',
            details: 'Organization 1',
            className: isDark 
              ? 'bg-amber-900/40 border-2 border-amber-700 text-white backdrop-blur-sm'
              : 'bg-amber-50 border-2 border-amber-200 text-amber-900',
            icon: <Database className="h-4 w-4 text-amber-500" />,
          },
        },
        {
          id: 'ledger-org2',
          type: 'custom',
          position: { x: 500, y: 450 },
          data: {
            label: 'Ledger',
            details: 'Organization 2',
            className: isDark 
              ? 'bg-amber-900/40 border-2 border-amber-700 text-white backdrop-blur-sm'
              : 'bg-amber-50 border-2 border-amber-200 text-amber-900',
            icon: <Database className="h-4 w-4 text-amber-500" />,
          },
        }
      );
    }

    // Initial edges connecting organizations to their peers
    const initialEdges: Edge[] = [
      // Org1 to its peers
      {
        id: 'org1-peer0-connection',
        source: 'org1',
        target: 'org1-peer0',
        type: 'smoothstep',
        style: { stroke: isDark ? '#93C5FD' : '#3B82F6', strokeWidth: 1.5 },
      },
      {
        id: 'org1-peer1-connection',
        source: 'org1',
        target: 'org1-peer1',
        type: 'smoothstep',
        style: { stroke: isDark ? '#93C5FD' : '#3B82F6', strokeWidth: 1.5 },
      },
      // Org2 to its peers
      {
        id: 'org2-peer0-connection',
        source: 'org2',
        target: 'org2-peer0',
        type: 'smoothstep',
        style: { stroke: isDark ? '#93C5FD' : '#3B82F6', strokeWidth: 1.5 },
      },
      {
        id: 'org2-peer1-connection',
        source: 'org2',
        target: 'org2-peer1',
        type: 'smoothstep',
        style: { stroke: isDark ? '#93C5FD' : '#3B82F6', strokeWidth: 1.5 },
      },
    ];

    // Add chaincode connections if enabled
    if (showChaincodeFlow) {
      initialEdges.push(
        {
          id: 'org1-peer0-chaincode',
          source: 'org1-peer0',
          target: 'chaincode-org1',
          type: 'smoothstep',
          style: { stroke: isDark ? '#93C5FD' : '#3B82F6', strokeWidth: 1.5, strokeDasharray: '5,5' },
        },
        {
          id: 'org1-peer1-chaincode',
          source: 'org1-peer1',
          target: 'chaincode-org1',
          type: 'smoothstep',
          style: { stroke: isDark ? '#93C5FD' : '#3B82F6', strokeWidth: 1.5, strokeDasharray: '5,5' },
        },
        {
          id: 'org2-peer0-chaincode',
          source: 'org2-peer0',
          target: 'chaincode-org2',
          type: 'smoothstep',
          style: { stroke: isDark ? '#93C5FD' : '#3B82F6', strokeWidth: 1.5, strokeDasharray: '5,5' },
        },
        {
          id: 'org2-peer1-chaincode',
          source: 'org2-peer1',
          target: 'chaincode-org2',
          type: 'smoothstep',
          style: { stroke: isDark ? '#93C5FD' : '#3B82F6', strokeWidth: 1.5, strokeDasharray: '5,5' },
        }
      );
    }

    // Add ledger connections if enabled
    if (showLedger) {
      initialEdges.push(
        {
          id: 'org1-peer0-ledger',
          source: 'org1-peer0',
          target: 'ledger-org1',
          type: 'smoothstep',
          style: { stroke: isDark ? '#FCD34D' : '#F59E0B', strokeWidth: 1.5, strokeDasharray: '5,5' },
        },
        {
          id: 'org1-peer1-ledger',
          source: 'org1-peer1',
          target: 'ledger-org1',
          type: 'smoothstep',
          style: { stroke: isDark ? '#FCD34D' : '#F59E0B', strokeWidth: 1.5, strokeDasharray: '5,5' },
        },
        {
          id: 'org2-peer0-ledger',
          source: 'org2-peer0',
          target: 'ledger-org2',
          type: 'smoothstep',
          style: { stroke: isDark ? '#FCD34D' : '#F59E0B', strokeWidth: 1.5, strokeDasharray: '5,5' },
        },
        {
          id: 'org2-peer1-ledger',
          source: 'org2-peer1',
          target: 'ledger-org2',
          type: 'smoothstep',
          style: { stroke: isDark ? '#FCD34D' : '#F59E0B', strokeWidth: 1.5, strokeDasharray: '5,5' },
        }
      );
    }

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [isDark, showLedger, showChaincodeFlow]);

  // Initialize nodes on component mount and when visualization options change
  useEffect(() => {
    initializeNodes();
  }, [initializeNodes, isDark, showLedger, showChaincodeFlow]);

  // Filter transactions based on search and status filter
  const filteredTransactions = state.transactions.filter(tx => {
    const matchesSearch = 
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.receiver.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.chaincode && tx.chaincode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.function && tx.function.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || tx.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Update chaincode function based on selected chaincode type
  const updateChaincodeFunction = (chaincodeType: string) => {
    let defaultFunction = 'createAsset';
    let defaultArgs = 'asset1, blue, 5, Tomoko, 300';
    
    switch (chaincodeType) {
      case 'Asset Management':
        defaultFunction = 'createAsset';
        defaultArgs = 'asset1, blue, 5, Tomoko, 300';
        break;
      case 'Token Contract':
        defaultFunction = 'transfer';
        defaultArgs = 'recipient123, 100';
        break;
      case 'Supply Chain':
        defaultFunction = 'createProduct';
        defaultArgs = 'prod1, Laptop, Electronics, SKU123, Manufacturer Inc, 1200';
        break;
      case 'Voting System':
        defaultFunction = 'castVote';
        defaultArgs = 'ballot1, 2';
        break;
      case 'Identity Management':
        defaultFunction = 'registerIdentity';
        defaultArgs = 'user123, John Doe, verified';
        break;
    }
    
    setNewTransaction(prev => ({
      ...prev,
      chaincode: chaincodeType,
      function: defaultFunction,
      args: defaultArgs
    }));
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <nav className={`sticky top-0 z-30 backdrop-blur-md ${isDark ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center ml-16 md:ml-0">
              <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              <span className="ml-2 text-xl font-semibold">
                Network Simulation
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={resetSimulation}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                } ${isDark ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'} text-white transition-colors duration-200`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                Reset Simulation
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ml-20 md:ml-auto transition-all duration-300">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transaction Form */}
          <div className={`glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
            <h2 className="text-lg font-medium mb-4">New Transaction</h2>
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-medium mb-1 opacity-70">
                  Sender
                </label>
                <select
                  value={newTransaction.sender}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, sender: e.target.value }))}
                  className={`block w-full rounded-lg ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Select Sender</option>
                  <option value="org1">Organization 1</option>
                  <option value="org2">Organization 2</option>
                </select>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-1 opacity-70">
                  Receiver
                </label>
                <select
                  value={newTransaction.receiver}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, receiver: e.target.value }))}
                  className={`block w-full rounded-lg ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  <option value="">Select Receiver</option>
                  <option value="org1">Organization 1</option>
                  <option value="org2">Organization 2</option>
                </select>
              </div>
              <div className="relative">
                <label className="block text-sm font-medium mb-1 opacity-70">
                  Transaction Type
                </label>
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction(prev => ({ ...prev, type: e.target.value }))}
                  className={`block w-full rounded-lg ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  {transactionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              {/* Chaincode Execution Details */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium mb-3">Chaincode Execution</h3>
                
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1 opacity-70">
                      Chaincode Type
                    </label>
                    <select
                      value={newTransaction.chaincode}
                      onChange={(e) => updateChaincodeFunction(e.target.value)}
                      className={`block w-full rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    >
                      {chaincodeTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1 opacity-70">
                      Function
                    </label>
                    <input
                      type="text"
                      value={newTransaction.function}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, function: e.target.value }))}
                      className={`block w-full rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1 opacity-70">
                      Arguments
                    </label>
                    <input
                      type="text"
                      value={newTransaction.args}
                      onChange={(e) => setNewTransaction(prev => ({ ...prev, args: e.target.value }))}
                      className={`block w-full rounded-lg ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Comma separated arguments"
                    />
                  </div>
                </div>
              </div>
              
              <button
                onClick={submitTransaction}
                disabled={!newTransaction.sender || !newTransaction.receiver || isLoading}
                className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg ${
                  !newTransaction.sender || !newTransaction.receiver || isLoading
                    ? isDark ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-300 cursor-not-allowed'
                    : isDark ? 'bg-indigo-700 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'
                } text-white transition-colors duration-200`}
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Submit Transaction
              </button>
            </div>
            {simulationStatus && (
              <div className={`mt-4 p-4 rounded-lg ${
                isDark ? 'bg-indigo-900/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
              }`}>
                <p className="text-sm">{simulationStatus}</p>
              </div>
            )}
            
            {/* Transaction Flow Phases */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-4">Transaction Flow Phases</h3>
              <div className="space-y-2">
                <div className={`p-3 rounded-lg flex items-center ${
                  activePhase === 'proposal' 
                    ? isDark ? 'bg-blue-900/30 text-blue-300 border border-blue-700' : 'bg-blue-50 text-blue-800 border border-blue-200'
                    : isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                }`}>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                    activePhase === 'proposal'
                      ? isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-200 text-blue-800'
                      : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>1</div>
                  <span className="text-sm">Proposal Phase</span>
                </div>
                
                <div className={`p-3 rounded-lg flex items-center ${
                  activePhase === 'endorsement' 
                    ? isDark ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-green-50 text-green-800 border border-green-200'
                    : isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                }`}>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                    activePhase === 'endorsement'
                      ? isDark ? 'bg-green-800 text-green-200' : 'bg-green-200 text-green-800'
                      : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>2</div>
                  <span className="text-sm">Endorsement Phase</span>
                </div>
                
                <div className={`p-3 rounded-lg flex items-center ${
                  activePhase === 'ordering' 
                    ? isDark ? 'bg-pink-900/30 text-pink-300 border border-pink-700' : 'bg-pink-50 text-pink-800 border border-pink-200'
                    : isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                }`}>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                    activePhase === 'ordering'
                      ? isDark ? 'bg-pink-800 text-pink-200' : 'bg-pink-200 text-pink-800'
                      : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>3</div>
                  <span className="text-sm">Ordering Phase</span>
                </div>
                
                <div className={`p-3 rounded-lg flex items-center ${
                  activePhase === 'distribution' 
                    ? isDark ? 'bg-purple-900/30 text-purple-300 border border-purple-700' : 'bg-purple-50 text-purple-800 border border-purple-200'
                    : isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                }`}>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                    activePhase === 'distribution'
                      ? isDark ? 'bg-purple-800 text-purple-200' : 'bg-purple-200 text-purple-800'
                      : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>4</div>
                  <span className="text-sm">Distribution Phase</span>
                </div>
                
                <div className={`p-3 rounded-lg flex items-center ${
                  activePhase === 'commit' 
                    ? isDark ? 'bg-amber-900/30 text-amber-300 border border-amber-700' : 'bg-amber-50 text-amber-800 border border-amber-200'
                    : isDark ? 'bg-gray-800/50' : 'bg-gray-100'
                }`}>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center mr-3 ${
                    activePhase === 'commit'
                      ? isDark ? 'bg-amber-800 text-amber-200' : 'bg-amber-200 text-amber-800'
                      : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>5</div>
                  <span className="text-sm">Validation & Commit Phase</span>
                </div>
                
                {activePhase === 'completed' && (
                  <div className={`p-3 rounded-lg flex items-center ${
                    isDark ? 'bg-green-900/30 text-green-300 border border-green-700' : 'bg-green-50 text- green-800 border border-green-200'
                  }`}>
                    <CheckCircle2 className="h-5 w-5 mr-3 text-green-500" />
                    <span className="text-sm">Transaction Completed Successfully</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Visualization Settings */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Visualization Settings</h3>
                <button
                  className={`p-1.5 rounded-lg ${
                    isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  } transition-colors duration-200`}
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Ledger Nodes</span>
                  <button
                    onClick={() => setShowLedger(!showLedger)}
                    className={`p-1.5 rounded-lg ${
                      showLedger 
                        ? isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                        : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                    } transition-colors duration-200`}
                  >
                    {showLedger ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Show Chaincode Nodes</span>
                  <button
                    onClick={() => setShowChaincodeFlow(!showChaincodeFlow)}
                    className={`p-1.5 rounded-lg ${
                      showChaincodeFlow 
                        ? isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                        : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                    } transition-colors duration-200`}
                  >
                    {showChaincodeFlow ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm flex items-center justify-between">
                    <span>Simulation Speed</span>
                    <span className="text-xs opacity-70">{simulationSpeed}ms</span>
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="500"
                    value={simulationSpeed}
                    onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs opacity-70">
                    <span>Fast</span>
                    <span>Slow</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Network Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium mb-3">Network Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-800/50' : 'bg-white'
                } shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-70">Blocks</p>
                      <p className="text-xl font-bold">{state.blocks.length}</p>
                    </div>
                    <BarChart4 className={`h-8 w-8 ${
                      isDark ? 'text-indigo-400 opacity-50' : 'text-indigo-200'
                    }`} />
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-800/50' : 'bg-white'
                } shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-70">Transactions</p>
                      <p className="text-xl font-bold">{state.transactions.length}</p>
                    </div>
                    <PieChart className={`h-8 w-8 ${
                      isDark ? 'text-green-400 opacity-50' : 'text-green-200'
                    }`} />
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-800/50' : 'bg-white'
                } shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-70">Success Rate</p>
                      <p className="text-xl font-bold">
                        {state.transactions.length > 0 
                          ? `${Math.round((state.transactions.filter(tx => tx.status === 'committed').length / state.transactions.length) * 100)}%` 
                          : '0%'}
                      </p>
                    </div>
                    <LineChart className={`h-8 w-8 ${
                      isDark ? 'text-purple-400 opacity-50' : 'text-purple-200'
                    }`} />
                  </div>
                </div>
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-800/50' : 'bg-white'
                } shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-70">Avg. Block Time</p>
                      <p className="text-xl font-bold">2.1s</p>
                    </div>
                    <Clock className={`h-8 w-8 ${
                      isDark ? 'text-yellow-400 opacity-50' : 'text-yellow-200'
                    }`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Network Visualization */}
          <div className={`lg:col-span-2 glass-card rounded-xl overflow-hidden ${isDark ? 'dark' : ''}`}>
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium">Chaincode Execution Flow</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowExecutionLogs(!showExecutionLogs)}
                  className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg ${
                    showExecutionLogs
                      ? isDark ? 'bg-indigo-700 text-white' : 'bg-indigo-600 text-white'
                      : isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700'
                  } transition-colors duration-200`}
                >
                  <FileCode className="h-4 w-4 mr-1" />
                  {showExecutionLogs ? 'Hide Logs' : 'Show Logs'}
                </button>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row">
              <div className={`${showExecutionLogs ? 'lg:w-2/3' : 'w-full'} h-[600px] relative`}>
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={nodeTypes}
                  fitView
                  onInit={setReactFlowInstance}
                >
                  <Background 
                    color={isDark ? '#6366f1' : '#a5b4fc'} 
                    gap={20} 
                    size={1} 
                    variant="dots" 
                  />
                  <Controls 
                    position="bottom-right"
                    showInteractive={false}
                    className="m-4"
                  />
                  <MiniMap 
                    nodeStrokeWidth={3}
                    nodeColor={(node) => {
                      if (node.id.includes('org')) return '#6366f1';
                      if (node.id.includes('peer')) return '#10b981';
                      if (node.id.includes('chaincode')) return '#3b82f6';
                      if (node.id.includes('ledger')) return '#f59e0b';
                      return '#8b5cf6';
                    }}
                    maskColor={isDark ? 'rgba(17, 24, 39, 0.7)' : 'rgba(255, 255, 255, 0.7)'}
                  />
                  <Panel position="top-right" className="m-4 flex space-x-2">
                    <button 
                      className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 shadow-md backdrop-blur-sm"
                      onClick={() => {
                        if (reactFlowInstance) {
                          reactFlowInstance.zoomIn();
                        }
                      }}
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button 
                      className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 shadow-md backdrop-blur-sm"
                      onClick={() => {
                        if (reactFlowInstance) {
                          reactFlowInstance.zoomOut();
                        }
                      }}
                    >
                      <ZoomOut size={16} />
                    </button>
                    <button 
                      className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 shadow-md backdrop-blur-sm"
                      onClick={() => {
                        if (reactFlowInstance) {
                          reactFlowInstance.fitView({ padding: 0.2 });
                        }
                      }}
                    >
                      <Maximize size={16} />
                    </button>
                    <button 
                      className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 shadow-md backdrop-blur-sm"
                      onClick={initializeNodes}
                    >
                      <RefreshCw size={16} />
                    </button>
                  </Panel>
                  
                  {/* Legend */}
                  <Panel position="top-left" className="m-4">
                    <div className="p-3 rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-md backdrop-blur-sm">
                      <h3 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-200">Network Components</h3>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                          <span className="text-gray-700 dark:text-gray-300">Organization</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                          <span className="text-gray-700 dark:text-gray-300">Peer</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                          <span className="text-gray-700 dark:text-gray-300">Orderer</span>
                        </div>
                        {showChaincodeFlow && (
                          <div className="flex items-center text-xs">
                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                            <span className="text-gray-700 dark:text-gray-300">Chaincode</span>
                          </div>
                        )}
                        {showLedger && (
                          <div className="flex items-center text-xs">
                            <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                            <span className="text-gray-700 dark:text-gray-300">Ledger</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Panel>
                  
                  {/* Transaction Animation Indicator */}
                  {simulationStatus && simulationStatus !== 'Transaction completed successfully' && (
                    <Panel position="bottom-left" className="m-4">
                      <div className={`p-3 rounded-lg ${
                        isDark ? 'bg-indigo-900/80' : 'bg-indigo-50/90'
                      } shadow-md backdrop-blur-sm`}>
                        <div className="flex items-center">
                          <Zap className={`h-4 w-4 mr-2 ${
                            isDark ? 'text-indigo-400' : 'text-indigo-600'
                          } animate-pulse`} />
                          <span className={`text-xs font-medium ${
                            isDark ? 'text-indigo-300' : 'text-indigo-700'
                          }`}>
                            {simulationStatus}
                          </span>
                        </div>
                      </div>
                    </Panel>
                  )}
                </ReactFlow>
              </div>
              
              {/* Execution Logs Panel */}
              {showExecutionLogs && (
                <div className={`lg:w-1/3 h-[600px] border-l border-gray-200 dark:border-gray-700 ${
                  isDark ? 'bg-gray-900' : 'bg-white'
                }`}>
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="text-sm font-medium">Execution Logs</h3>
                    <button
                      onClick={() => setExecutionLogs([])}
                      className={`p-1.5 rounded-lg ${
                        isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-4 h-[calc(600px-57px)] overflow-y-auto font-mono text-xs">
                    {executionLogs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                        <FileCode className="h-8 w-8 mb-2" />
                        <p>No execution logs yet</p>
                        <p className="mt-1">Submit a transaction to see logs</p>
                      </div>
                    ) : (
                      executionLogs.map((log, index) => {
                        // Color-code different types of logs
                        let logClass = '';
                        if (log.includes('Phase')) {
                          logClass = isDark ? 'text-blue-400' : 'text-blue-600';
                        } else if (log.includes('error') || log.includes('failed')) {
                          logClass = isDark ? 'text-red-400' : 'text-red-600';
                        } else if (log.includes('completed successfully')) {
                          logClass = isDark ? 'text-green-400' : 'text-green-600';
                        } else if (log.includes('Chaincode')) {
                          logClass = isDark ? 'text-purple-400' : 'text-purple-600';
                        }
                        
                        return (
                          <div key={index} className={`mb-1 ${logClass}`}>
                            {log}
                          </div>
                        );
                      })
                    )}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Transaction History */}
          <div className={`lg:col-span-3 glass-card rounded-xl p-6 ${isDark ? 'dark' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium">Transaction History</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-9 pr-4 py-2 text-sm rounded-lg ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className={`pl-9 pr-4 py-2 text-sm rounded-lg ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="committed">Committed</option>
                    <option value="failed">Failed</option>
                  </select>
                  <Filter className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className={`min-w-full divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                <thead>
                  <tr>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Block Height
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Transaction ID
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Type
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Chaincode
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Sender
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Receiver
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Timestamp
                    </th>
                    <th className={`px-6 py-3 ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-left text-xs font-medium uppercase tracking-wider opacity-70`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                      <React.Fragment key={tx.id}>
                        <tr className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-150`}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {tx.blockHeight}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                            {tx.id.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                            {tx.type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                            {tx.chaincode || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                            {tx.sender}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                            {tx.receiver}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tx.status === 'committed'
                                ? isDark ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800'
                                : tx.status === 'pending'
                                ? isDark ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800'
                                : isDark ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
                            }`}>
                              {tx.status === 'committed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {tx.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                              {tx.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm opacity-70">
                            {new Date(tx.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() => setShowTransactionDetails(showTransactionDetails === tx.id ? null : tx.id)}
                              className={`p-1 rounded-full ${
                                isDark 
                                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                                  : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                              }`}
                            >
                              {showTransactionDetails === tx.id ? (
                                <ChevronDown className="h-5 w-5" />
                              ) : (
                                <ChevronRight className="h-5 w-5" />
                              )}
                            </button>
                          </td>
                        </tr>
                        {showTransactionDetails === tx.id && (
                          <tr className={isDark ? 'bg-gray-800/30' : 'bg-gray-50'}>
                            <td colSpan={9} className="px-6 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Transaction Details</h4>
                                  <div className="space-y-1 text-sm">
                                    <div className="grid grid-cols-3 gap-2">
                                      <span className="opacity-70">Full ID:</span>
                                      <span className="col-span-2 font-mono">{tx.id}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                      <span className="opacity-70">Block Height:</span>
                                      <span className="col-span-2">{tx.blockHeight}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                      <span className="opacity-70">Type:</span>
                                      <span className="col-span-2">{tx.type}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                      <span className="opacity-70">Status:</span>
                                      <span className="col-span-2">{tx.status}</span>
                                    </div>
                                    {tx.chaincode && (
                                      <>
                                        <div className="grid grid-cols-3 gap-2">
                                          <span className="opacity-70">Chaincode:</span>
                                          <span className="col-span-2">{tx.chaincode}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                          <span className="opacity-70">Function:</span>
                                          <span className="col-span-2">{tx.function}</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                          <span className="opacity-70">Arguments:</span>
                                          <span className="col-span-2 font-mono text-xs">{tx.args}</span>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium mb-2">Transaction Flow</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center">
                                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                                        isDark ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                                      }`}>1</div>
                                      <ArrowRight className="h-4 w-4 mx-2 opacity-50" />
                                      <span>Client submits transaction proposal</span>
                                    </div>
                                    <div className="flex items-center">
                                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                                        isDark ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                                      }`}>2</div>
                                      <ArrowRight className="h-4 w-4 mx-2 opacity-50" />
                                      <span>Peers execute and endorse transaction</span>
                                    </div>
                                    <div className="flex items-center">
                                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                                        isDark ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                                      }`}>3</div>
                                      <ArrowRight className="h-4 w-4 mx-2 opacity-50" />
                                      <span>Client sends endorsed transaction to orderer</span>
                                    </div>
                                    <div className="flex items-center">
                                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                                        isDark ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                                      }`}>4</div>
                                      <ArrowRight className="h-4 w-4 mx-2 opacity-50" />
                                      <span>Orderer creates block and distributes</span>
                                    </div>
                                    <div className="flex items-center">
                                      <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                                        isDark ? 'bg-indigo-900 text-indigo-300' : 'bg-indigo-100 text-indigo-700'
                                      }`}>5</div>
                                      <ArrowRight className="h-4 w-4 mx-2 opacity-50" />
                                      <span>Peers validate and commit block</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-10 text-center">
                        <p className="text-sm opacity-70">No transactions found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}