import React from 'react';
import { Download } from 'lucide-react';
import type { YAMLConfig } from '../../types';
import Button from '../ui/Button';

interface YAMLPreviewProps {
  yamlConfig: YAMLConfig;
  onDownload: (type: 'configtx' | 'cryptoConfig' | 'dockerCompose') => void;
  isDark: boolean;
}

const YAMLPreview: React.FC<YAMLPreviewProps> = ({
  yamlConfig,
  onDownload,
  isDark,
}) => {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Generated Configurations</h2>
        <div className="flex space-x-2">
          <Button
            onClick={() => onDownload('configtx')}
            variant="secondary"
            icon={Download}
          >
            configtx.yaml
          </Button>
          <Button
            onClick={() => onDownload('cryptoConfig')}
            variant="secondary"
            icon={Download}
          >
            crypto-config.yaml
          </Button>
          <Button
            onClick={() => onDownload('dockerCompose')}
            variant="secondary"
            icon={Download}
          >
            docker-compose.yaml
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="text-sm font-medium mb-2">configtx.yaml</h3>
          <pre className={`text-xs ${
            isDark ? 'bg-gray-800' : 'bg-gray-50'
          } p-4 rounded-lg overflow-auto max-h-96`}>
            {yamlConfig.configtx}
          </pre>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">crypto-config.yaml</h3>
          <pre className={`text-xs ${
            isDark ? 'bg-gray-800' : 'bg-gray-50'
          } p-4 rounded-lg overflow-auto max-h-96`}>
            {yamlConfig.cryptoConfig}
          </pre>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">docker-compose.yaml</h3>
          <pre className={`text-xs ${
            isDark ? 'bg-gray-800' : 'bg-gray-50'
          } p-4 rounded-lg overflow-auto max-h-96`}>
            {yamlConfig.dockerCompose}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default YAMLPreview;