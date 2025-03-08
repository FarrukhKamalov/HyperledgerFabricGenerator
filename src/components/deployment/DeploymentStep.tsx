import React, { useState } from 'react';
import { Copy, Check, ChevronRight, ChevronDown, Info } from 'lucide-react';
import Button from '../ui/Button';

interface DeploymentStepProps {
  step: {
    id: string;
    title: string;
    description: string;
    command: string;
    output: string;
    tips: string[];
    status: 'pending' | 'in-progress' | 'completed' | 'error';
  };
  index: number;
  currentStep: number;
  isDark: boolean;
  onSelect: (index: number) => void;
  getStepStatusIcon: (status: string) => React.ReactNode;
}

const DeploymentStep: React.FC<DeploymentStepProps> = ({
  step,
  index,
  currentStep,
  isDark,
  onSelect,
  getStepStatusIcon
}) => {
  const [copied, setCopied] = useState(false);
  const [expandedTips, setExpandedTips] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const toggleTips = () => {
    setExpandedTips(!expandedTips);
  };

  return (
    <div>
      <button
        onClick={() => onSelect(index)}
        className={`w-full flex items-center p-2 rounded-lg text-left transition-colors duration-200 ${
          currentStep === index
            ? isDark ? 'bg-indigo-900/50 text-indigo-300' : 'bg-indigo-100 text-indigo-800'
            : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
        }`}
      >
        <div className="flex-shrink-0 mr-3">
          {getStepStatusIcon(step.status)}
        </div>
        <span className={`text-sm ${
          step.status === 'completed' ? 'line-through opacity-70' : ''
        }`}>
          {index + 1}. {step.title}
        </span>
      </button>

      {currentStep === index && (
        <div className="mt-4">
          <div className="mb-6">
            <h2 className="text-xl font-bold">{index + 1}. {step.title}</h2>
            <p className="mt-2">{step.description}</p>
          </div>
          
          {/* Command */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Command</h3>
              <button
                onClick={() => copyToClipboard(step.command)}
                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } transition-colors duration-200`}
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </button>
            </div>
            <div className={`p-4 rounded-lg font-mono text-sm overflow-x-auto ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              {step.command}
            </div>
          </div>
          
          {/* Output */}
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2">Expected Output</h3>
            <div className={`p-4 rounded-lg font-mono text-sm overflow-x-auto ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              <pre className="whitespace-pre-wrap">{step.output}</pre>
            </div>
          </div>
          
          {/* Tips */}
          <div>
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={toggleTips}
            >
              <h3 className="text-sm font-medium">Tips & Notes</h3>
              {expandedTips ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </div>
            
            {expandedTips && (
              <div className="mt-2 space-y-2">
                {step.tips.map((tip, index) => (
                  <div 
                    key={index}
                    className={`flex p-3 rounded-lg ${
                      isDark ? 'bg-gray-800/50' : 'bg-gray-50'
                    }`}
                  >
                    <Info className={`h-5 w-5 mr-2 flex-shrink-0 ${
                      isDark ? 'text-indigo-400' : 'text-indigo-600'
                    }`} />
                    <span className="text-sm">{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentStep;