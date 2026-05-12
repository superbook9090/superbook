// src/features/ai/components/AIThinkingLoader.tsx

import React from 'react';
import { Brain, Loader2 } from 'lucide-react';
import { AIThinkingLoaderProps } from '../types';

const AIThinkingLoader: React.FC<AIThinkingLoaderProps> = ({
  message = 'AI is analyzing your answer...',
  progress = 0,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {/* Animated Brain Icon */}
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping" />
        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full">
          <Brain className="w-8 h-8 text-white animate-pulse" />
        </div>
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-2">
        <p className="text-gray-700 font-medium animate-pulse">{message}</p>
        
        {/* Progress Bar */}
        {progress > 0 && (
          <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>

      {/* Loading Dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>

      {/* Model Info */}
      <div className="text-xs text-gray-500 text-center">
        <p>Using lightweight AI model for fast analysis</p>
      </div>
    </div>
  );
};

export default AIThinkingLoader;
