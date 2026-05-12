// src/features/ai/components/AnalysisButton.tsx

import React from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { AnalysisButtonProps } from '../types';

const AnalysisButton: React.FC<AnalysisButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg
        bg-gradient-to-r from-blue-500 to-purple-600 text-white
        hover:from-blue-600 hover:to-purple-700
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200 transform hover:scale-105 active:scale-95
        shadow-md hover:shadow-lg
        ${className}
      `}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Brain className="w-4 h-4" />
          Analyze Answer
        </>
      )}
    </button>
  );
};

export default AnalysisButton;
