import React, { useState } from 'react';
import { Download, FileText, Terminal, Code, Check, Copy } from 'lucide-react';
import Card from './common/Card';
import Button from './ui/Button';
import CodeBlock from './ui/CodeBlock';
import { NetworkConfig } from '../types';
import { generateYAMLConfigs } from '../utils/yamlGenerator';
import { generateNetworkScript } from '../utils/networkScripts';
import JSZip from 'jszip';

interface NetworkConfigExportProps {
  config: NetworkConfig;
  isDark: boolean;
}

const NetworkConfigExport: React.FC<NetworkConfigExportProps> = ({ config, isDark }) => {
  const [activeTab, setActiveTab] = useState<'configtx' | 'crypto-config' | 'docker-compose' | 'network-script'>('configtx');
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const yamlConfigs = generateYAMLConfigs(config);
  const networkScript = generateNetworkScript();

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = async () => {
    try {
      const zip = new JSZip();
      
      // Add configuration files
      zip.file('configtx.yaml', yamlConfigs.configtx);
      zip.file('crypto-config.yaml', yamlConfigs.cryptoConfig);
      zip.file('docker-compose.yaml', yamlConfigs.dockerCompose);
      zip.file('network.sh', networkScript);
      
      // Add README
      const readme = `# Hyperledger Fabric Network Configuration

## Network Overview
- Channel Name: ${config.channelName || 'mychannel'}
- Organizations: ${config.organizations.length}
- Peers: ${config.organizations.reduce((sum, org) => sum + org.peers.length, 0)}
- Orderers: ${config.orderers.length}

## Setup Instructions

1. Make the network script executable:
   \`\`\`bash
   chmod +x network.sh
   \`\`\`

2. Start the network:
   \`\`\`bash
   ./network.sh up
   \`\`\`

3. Create the channel:
   \`\`\`bash
   ./network.sh createChannel
   \`\`\`

4. Deploy chaincode:
   \`\`\`bash
   ./network.sh deployCC
   \`\`\`

## File Structure
- configtx.yaml: Channel configuration
- crypto-config.yaml: Cryptographic material configuration
- docker-compose.yaml: Container configuration
- network.sh: Network management script

## Additional Information
- State Database: ${config.stateDatabase || 'goleveldb'}
- Network Version: ${config.networkVersion || '2.0'}
`;
      zip.file('README.md', readme);
      
      // Generate zip file
      const content = await zip.generateAsync({ type: 'blob' });
      
      // Create download link
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'fabric-network-configs.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating zip file:', error);
      alert('Failed to create zip file. Please try downloading files individually.');
    }
  };

  return (
    <div className="space-y-6">
      <Card isDark={isDark}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
            <h2 className="text-lg font-medium">Network Configuration Files</h2>
          </div>
          <Button
            onClick={downloadAllFiles}
            variant="primary"
            icon={Download}
          >
            Download All Files
          </Button>
        </div>

        <div className="mb-6">
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
            <Button
              onClick={() => setActiveTab('configtx')}
              variant={activeTab === 'configtx' ? 'primary' : 'outline'}
            >
              configtx.yaml
            </Button>
            <Button
              onClick={() => setActiveTab('crypto-config')}
              variant={activeTab === 'crypto-config' ? 'primary' : 'outline'}
            >
              crypto-config.yaml
            </Button>
            <Button
              onClick={() => setActiveTab('docker-compose')}
              variant={activeTab === 'docker-compose' ? 'primary' : 'outline'}
            >
              docker-compose.yaml
            </Button>
            <Button
              onClick={() => setActiveTab('network-script')}
              variant={activeTab === 'network-script' ? 'primary' : 'outline'}
            >
              network.sh
            </Button>
          </div>

          {activeTab === 'configtx' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">configtx.yaml</h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => copyToClipboard(yamlConfigs.configtx)}
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    onClick={() => downloadFile(yamlConfigs.configtx, 'configtx.yaml')}
                    variant="outline"
                    size="sm"
                    icon={Download}
                  >
                    Download
                  </Button>
                </div>
              </div>
              <CodeBlock
                code={yamlConfigs.configtx}
                language="yaml"
                showLineNumbers={true}
                isDark={isDark}
              />
            </div>
          )}

          {activeTab === 'crypto-config' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">crypto-config.yaml</h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => copyToClipboard(yamlConfigs.cryptoConfig)}
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    onClick={() => downloadFile(yamlConfigs.cryptoConfig, 'crypto-config.yaml')}
                    variant="outline"
                    size="sm"
                    icon={Download}
                  >
                    Download
                  </Button>
                </div>
              </div>
              <CodeBlock
                code={yamlConfigs.cryptoConfig}
                language="yaml"
                showLineNumbers={true}
                isDark={isDark}
              />
            </div>
          )}

          {activeTab === 'docker-compose' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">docker-compose.yaml</h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => copyToClipboard(yamlConfigs.dockerCompose)}
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    onClick={() => downloadFile(yamlConfigs.dockerCompose, 'docker-compose.yaml')}
                    variant="outline"
                    size="sm"
                    icon={Download}
                  >
                    Download
                  </Button>
                </div>
              </div>
              <CodeBlock
                code={yamlConfigs.dockerCompose}
                language="yaml"
                showLineNumbers={true}
                isDark={isDark}
              />
            </div>
          )}

          {activeTab === 'network-script' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">network.sh</h3>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => copyToClipboard(networkScript)}
                    variant="outline"
                    size="sm"
                    icon={copied ? Check : Copy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button
                    onClick={() => downloadFile(networkScript, 'network.sh')}
                    variant="outline"
                    size="sm"
                    icon={Download}
                  >
                    Download
                  </Button>
                </div>
              </div>
              <CodeBlock
                code={networkScript}
                language="bash"
                showLineNumbers={true}
                isDark={isDark}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Configuration Summary</h3>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Channel Name:</span> {config.channelName || 'mychannel'}
                </div>
                <div>
                  <span className="font-medium">Consortium:</span> {config.consortium || 'SampleConsortium'}
                </div>
                <div>
                  <span className="font-medium">Network Version:</span> {config.networkVersion || '2.0'}
                </div>
                <div>
                  <span className="font-medium">State Database:</span> {config.stateDatabase || 'CouchDB'}
                </div>
                <div>
                  <span className="font-medium">Organizations:</span> {config.organizations.length}
                </div>
                <div>
                  <span className="font-medium">Total Peers:</span> {config.organizations.reduce((sum, org) => sum + org.peers.length, 0)}
                </div>
                <div>
                  <span className="font-medium">Orderers:</span> {config.orderers.length}
                </div>
                <div>
                  <span className="font-medium">Orderer Type:</span> {config.orderers[0]?.type || 'etcdraft'}
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Deployment Instructions</h3>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Download all configuration files</li>
                <li>Make the network script executable: <code>chmod +x network.sh</code></li>
                <li>Create required directories:
                  <ul className="list-disc list-inside ml-4 mt-1 text-xs opacity-80">
                    <li>channel-artifacts</li>
                    <li>crypto-config</li>
                    <li>chaincode</li>
                  </ul>
                </li>
                <li>Start the network: <code>./network.sh up</code></li>
                <li>Create a channel: <code>./network.sh createChannel</code></li>
                <li>Deploy chaincode: <code>./network.sh deployCC</code></li>
              </ol>
              <div className="mt-4 flex items-start">
                <Terminal className="h-4 w-4 mr-2 mt-1 text-indigo-500" />
                <span className="text-sm">
                  For more options, run: <code>./network.sh -h</code>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NetworkConfigExport;