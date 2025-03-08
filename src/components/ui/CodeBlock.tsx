import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  isDark?: boolean;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'bash',
  showLineNumbers = false,
  isDark = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="absolute right-2 top-2">
        <button
          onClick={copyToClipboard}
          className={`p-1.5 rounded-md ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          } transition-colors duration-200`}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <div className={`p-4 rounded-lg font-mono text-sm overflow-x-auto ${
        isDark ? 'bg-gray-800' : 'bg-gray-50'
      }`}>
        {showLineNumbers ? (
          <table className="border-collapse">
            <tbody>
              {code.split('\n').map((line, i) => (
                <tr key={i}>
                  <td className={`pr-4 text-right select-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {i + 1}
                  </td>
                  <td><pre>{line}</pre></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre className="whitespace-pre-wrap">{code}</pre>
        )}
      </div>
    </div>
  );
};

export default CodeBlock;