'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useFeature } from '@/contexts/AppSettingsContext';
import { useAlert } from '@/components/ui/AlertContainer';
import { analyzeQuizSolution } from '@/lib/api/quizSolutionAnalysis';
import { getApiErrorMessage } from '@/lib/api/http';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/lib/utils';

type Props = {
  attemptId: string;
  questionId: string;
  className?: string;
};

export function QuizSolutionAnalysis({ attemptId, questionId, className }: Props) {
  const { t } = useTranslation();
  const isEnabled = useFeature('enableQuizSolutionAnalysis');
  const { addAlert } = useAlert();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      const data = await analyzeQuizSolution({ attemptId, questionId });
      setAnalysis(data.analysis);
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, t('quizResult.solutionAnalysisFailed'));
      addAlert({
        type: 'error',
        message: errorMsg,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEnabled) {
    return null;
  }

  return (
    <div className={cn('pt-2 border-t border-[var(--color-border)]', className)}>
      {!analysis && (
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isLoading}
          className="inline-flex items-center gap-2 min-h-[36px] px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/15 transition-colors disabled:opacity-60"
        >
          {isLoading ? (
            <Loader size="sm" />
          ) : (
            <Sparkles className="w-4 h-4 shrink-0" />
          )}
          {isLoading ? t('quizResult.analyzingSolution') : t('quizResult.analyzeSolution')}
        </button>
      )}


      {analysis && (
        <div className="mt-2 rounded-lg bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)] mb-1.5">
            {t('quizResult.solutionAnalysis')}
          </p>
          <p className="text-sm text-[var(--color-foreground)] leading-relaxed whitespace-pre-wrap">
            {analysis}
          </p>
        </div>
      )}
    </div>
  );
}
