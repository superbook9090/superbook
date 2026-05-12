// src/features/ai/components/QuizAnalysisModal.tsx

import React from 'react';
import { X, Brain, AlertCircle, RefreshCw } from 'lucide-react';
import { QuizAnalysisModalProps } from '../types';
import AIThinkingLoader from './AIThinkingLoader';
import AIResponseCard from './AIResponseCard';
import { useTranslation } from '@/hooks/useTranslation';

const QuizAnalysisModal: React.FC<QuizAnalysisModalProps> = ({
  isOpen,
  onClose,
  question,
  options,
  selectedAnswer,
  correctAnswer,
  analysis,
  loading = false,
  error,
  onRetry,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getAnswerLabel = (index: number) => {
    return String.fromCharCode(65 + index); // A, B, C, D, etc.
  };

  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6" />
              <h2 className="text-xl font-bold">{t('ai.analysis')}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Question Details */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">{t('ai.question')}</h3>
            <p className="text-gray-700 mb-4">{question}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((option, index) => {
                const isSelected = index === selectedAnswer;
                const isCorrect = index === correctAnswer;
                
                return (
                  <div
                    key={index}
                    className={`
                      p-3 rounded-lg border-2 transition-all
                      ${isSelected && isCorrect ? 'border-green-500 bg-green-50' : ''}
                      ${isSelected && !isCorrect ? 'border-red-500 bg-red-50' : ''}
                      ${!isSelected && isCorrect ? 'border-green-500 bg-green-50' : ''}
                      ${!isSelected && !isCorrect ? 'border-gray-200 bg-white' : ''}
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {getAnswerLabel(index)}.
                      </span>
                      <span className="text-gray-700">{option}</span>
                      {isSelected && (
                        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          {t('ai.yourAnswer')}
                        </span>
                      )}
                      {isCorrect && (
                        <span className="ml-auto text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          {t('ai.correctAnswer')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <AIThinkingLoader 
              message={t('ai.generating')}
            />
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 mb-1">{t('ai.analysisFailed')}</h4>
                  <p className="text-sm text-red-700 mb-3">{error}</p>
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      {t('ai.retry')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analysis Result */}
          {analysis && !loading && (
            <AIResponseCard
              analysis={analysis}
              onCopyExplanation={() => {
                // Handle copy explanation
                console.log('Copy explanation clicked');
              }}
              onExplainSimpler={() => {
                // Handle explain simpler
                console.log('Explain simpler clicked');
              }}
              onGiveExample={() => {
                // Handle give example
                console.log('Give example clicked');
              }}
            />
          )}

          {/* Model Info */}
          {analysis && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-blue-700">
                  <Brain className="w-4 h-4" />
                  <span>Powered by {analysis.modelUsed || 'local AI'}</span>
                </div>
                {analysis.processingTime && (
                  <span className="text-blue-600">
                    Generated in {analysis.processingTime}ms
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {isCorrect 
                ? 'Great job! You got this question correct.' 
                : 'Keep learning! Review the explanation to understand better.'
              }
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAnalysisModal;
