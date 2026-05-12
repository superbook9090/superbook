// src/features/ai/components/AIResponseCard.tsx

import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  BookOpen, 
  TrendingUp, 
  Copy, 
  MessageSquare,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { AIResponseCardProps } from '../types';
import { useTranslation } from '@/hooks/useTranslation';

const AIResponseCard: React.FC<AIResponseCardProps> = ({
  analysis,
  onCopyExplanation,
  onExplainSimpler,
  onGiveExample,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `
${t('ai.summary')}: ${analysis.summary}
${analysis.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
${t('ai.why')}: ${analysis.whySelectedAnswerIsRightOrWrong}
${t('ai.whyCorrectAnswer')}: ${analysis.whyCorrectAnswerIsCorrect}
${t('ai.concept')}: ${analysis.keyConceptExplanation}
${t('ai.studyTip')}: ${analysis.studyTip}
${t('ai.confidence')}: ${analysis.confidenceLevel}%
    `.trim();

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      onCopyExplanation?.();
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const confidenceColor = analysis.confidenceLevel >= 80 ? 'text-green-600' : 
                          analysis.confidenceLevel >= 60 ? 'text-yellow-600' : 
                          'text-red-600';

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-5/6" />
          <div className="h-3 bg-gray-200 rounded w-4/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {analysis.isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{t('ai.analysis')}</h3>
              <p className="text-sm text-gray-600">{analysis.summary}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${confidenceColor}`}>
              {analysis.confidenceLevel}% {t('ai.confidence')}
            </span>
            {analysis.processingTime && (
              <span className="text-xs text-gray-500">
                {analysis.processingTime}ms
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Your Answer Analysis */}
        <div className="border-l-4 border-blue-500 pl-4">
          <button
            onClick={() => toggleSection('yourAnswer')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">{t('ai.yourAnswer')}</h4>
            {expandedSection === 'yourAnswer' ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {expandedSection === 'yourAnswer' && (
            <p className="mt-2 text-sm text-gray-700">
              {analysis.whySelectedAnswerIsRightOrWrong}
            </p>
          )}
        </div>

        {/* Correct Answer Explanation */}
        <div className="border-l-4 border-green-500 pl-4">
          <button
            onClick={() => toggleSection('correctAnswer')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-medium text-gray-900">{t('ai.correctAnswer')}</h4>
            {expandedSection === 'correctAnswer' ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {expandedSection === 'correctAnswer' && (
            <p className="mt-2 text-sm text-gray-700">
              {analysis.whyCorrectAnswerIsCorrect}
            </p>
          )}
        </div>

        {/* Key Concept */}
        <div className="border-l-4 border-purple-500 pl-4">
          <button
            onClick={() => toggleSection('concept')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-purple-500" />
              <h4 className="font-medium text-gray-900">{t('ai.concept')}</h4>
            </div>
            {expandedSection === 'concept' ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {expandedSection === 'concept' && (
            <p className="mt-2 text-sm text-gray-700">
              {analysis.keyConceptExplanation}
            </p>
          )}
        </div>

        {/* Study Tip */}
        <div className="border-l-4 border-yellow-500 pl-4">
          <button
            onClick={() => toggleSection('studyTip')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-500" />
              <h4 className="font-medium text-gray-900">{t('ai.studyTip')}</h4>
            </div>
            {expandedSection === 'studyTip' ? (
              <ChevronUp className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </button>
          {expandedSection === 'studyTip' && (
            <p className="mt-2 text-sm text-gray-700">
              {analysis.studyTip}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <Copy className="w-3 h-3" />
            {copied ? t('ai.copied') : t('ai.copy')}
          </button>
          
          {onExplainSimpler && (
            <button
              onClick={onExplainSimpler}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="w-3 h-3" />
              {t('ai.explainSimpler')}
            </button>
          )}
          
          {onGiveExample && (
            <button
              onClick={onGiveExample}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="w-3 h-3" />
              {t('ai.giveExample')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIResponseCard;
