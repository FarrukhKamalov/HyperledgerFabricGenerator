import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  useNodesState,
  useEdgesState,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { NetworkConfig, Organization, Orderer } from '../types';
import { toPng } from 'html-to-image';
import { Download, ZoomIn, ZoomOut, Maximize, RefreshCw } from 'lucide-react';

interface NetworkVisualizerProps {
  config: NetworkConfig;
  onNodeClick: (nodeId: string, type: 'org' | 'peer' | 'orderer') => void;
  isDark: boolean;
}

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

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export default function NetworkVisualizer({ config, onNodeClick, isDark }: NetworkVisualizerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Generate nodes and edges based on config
  React.useEffect(() => {
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    let yOffset = 0;

    // Add organizations and their peers
    config.organizations.forEach((org, orgIndex) => {
      const orgNode: Node = {
        id: `org-${org.id}`,
        type: 'custom',
        position: { x: 200, y: yOffset },
        data: {
          label: org.name,
          details: `MSP: ${org.mspID}`,
          className: isDark 
            ? 'bg-indigo-900/40 border-2 border-indigo-700 text-white backdrop-blur-sm'
            : 'bg-indigo-50 border-2 border-indigo-200 text-indigo-900',
          icon: <div className="w-4 h-4 rounded-full bg-indigo-500" />,
        },
      };
      newNodes.push(orgNode);

      // Add peers for this organization
      org.peers.forEach((peer, peerIndex) => {
        const peerNode: Node = {
          id: `peer-${peer.id}`,
          type: 'custom',
          position: { x: 500, y: yOffset + (peerIndex * 100) },
          data: {
            label: peer.name,
            details: `Port: ${peer.port}`,
            className: isDark 
              ? 'bg-green-900/40 border-2 border-green-700 text-white backdrop-blur-sm'
              : 'bg-green-50 border-2 border-green-200 text-green-900',
            icon: <div className="w-4 h-4 rounded-full bg-green-500" />,
          },
        };
        newNodes.push(peerNode);

        // Connect org to peer
        newEdges.push({
          id: `${orgNode.id}-${peerNode.id}`,
          source: orgNode.id,
          target: peerNode.id,
          type: 'smoothstep',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: isDark ? '#93C5FD' : '#3B82F6', strokeWidth: 2 },
        });
      });

      yOffset += Math.max(org.peers.length * 100, 150);
    });

    // Add orderers
    config.orderers.forEach((orderer, index) => {
      const ordererNode: Node = {
        id: `orderer-${orderer.id}`,
        type: 'custom',
        position: { x: 800, y: 100 + (index * 100) },
        data: {
          label: orderer.name,
          details: `Type: ${orderer.type}`,
          className: isDark 
            ? 'bg-purple-900/40 border-2 border-purple-700 text-white backdrop-blur-sm'
            : 'bg-purple-50 border-2 border-purple-200 text-purple-900',
          icon: <div className="w-4 h-4 rounded-full bg-purple-500" />,
        },
      };
      newNodes.push(ordererNode);

      // Connect all orgs to orderer
      config.organizations.forEach(org => {
        newEdges.push({
          id: `org-${org.id}-orderer-${orderer.id}`,
          source: `org-${org.id}`,
          target: `orderer-${orderer.id}`,
          type: 'smoothstep',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed },
          style: { stroke: isDark ? '#C4B5FD' : '#8B5CF6', strokeWidth: 2 },
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  }, [config, setNodes, setEdges, isDark]);

  const exportToPng = useCallback(() => {
    const element = document.querySelector('.react-flow') as HTMLElement;
    if (element) {
      toPng(element, {
        backgroundColor: isDark ? '#111827' : '#ffffff',
        width: element.offsetWidth * 2,
        height: element.offsetHeight * 2,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
        },
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'network-diagram.png';
          link.href = dataUrl;
          link.click();
        })
        .catch((error) => {
          console.error('Error exporting diagram:', error);
        });
    }
  }, [isDark]);

  const handleNodeClick = (event: React.MouseEvent, node: Node) => {
    const [type, id] = node.id.split('-');
    onNodeClick(id, type as 'org' | 'peer' | 'orderer');
  };

  const proOptions = useMemo(() => ({ hideAttribution: true }), []);

  return (
    <div className={`glass-card rounded-xl overflow-hidden ${isDark ? 'dark' : ''}`}>
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Network Visualization</h2>
        <div className="flex space-x-2">
          <button
            onClick={exportToPng}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 hover:bg-indigo-200 dark:hover:bg-indigo-800/50 transition-colors"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>
      </div>
      <div className="h-[600px] relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          proOptions={proOptions}
          fitView
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
              return '#8b5cf6';
            }}
            maskColor={isDark ? 'rgba(17, 24, 39, 0.7)' : 'rgba(255, 255, 255, 0.7)'}
          />
          <Panel position="top-right" className="m-4 flex space-x-2">
            <button className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 shadow-md backdrop-blur-sm">
              <ZoomIn size={16} />
            </button>
            <button className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 shadow-md backdrop-blur-sm">
              <ZoomOut size={16} />
            </button>
            <button className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 shadow-md backdrop-blur-sm">
              <Maximize size={16} />
            </button>
            <button className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 shadow-md backdrop-blur-sm">
              <RefreshCw size={16} />
            </button>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}