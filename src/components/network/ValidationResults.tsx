import React from 'react';
import { XCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { ValidationResult } from '../../utils/networkValidator';

interface ValidationResultsProps {
  results: ValidationResult[];
  isDark: boolean;
}

const ValidationResults: React.FC<ValidationResultsProps> = ({
  results,
  isDark,
}) => {
  if (results.length === 0) return null;

  return (
    <div className={`glass-card rounded-xl p-6 mb-8 ${isDark ? 'dark' : ''}`}>
      <h2 className="text-lg font-medium mb-4">Configuration Check Results</h2>
      <div className="space-y-4">
        {results.map((result, index) => (
          <div
            key={index}
            className={`flex items-start p-4 rounded-lg ${
              result.status === 'error'
                ? isDark ? 'bg-red-900/20 text-red-300' : 'bg-red-50 text-red-800'
                : result.status === 'warning'
                ? isDark ? 'bg-yellow-900/20 text-yellow-300' : 'bg-yellow-50 text-yellow-800'
                : isDark ? 'bg-green-900/20 text-green-300' : 'bg-green-50 text-green-800'
            }`}
          >
            {result.status === 'error' ? (
              <XCircle className="h-5 w-5 mt-0.5" />
            ) : result.status === 'warning' ? (
              <AlertTriangle className="h-5 w-5 mt-0.5" />
            ) : (
              <CheckCircle2 className="h-5 w-5 mt-0.5" />
            )}
            <div className="ml-3">
              <p className="text-sm font-medium">
                {result.message}
              </p>
              {result.fix && (
                <p className="text-sm mt-1 opacity-80">
                  Suggestion: {result.fix}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValidationResults;