'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useFeature } from '@/contexts/AppSettingsContext';
import { analyzeQuizSolution } from '@/lib/api/quizSolutionAnalysis';
import { ApiClientError, getApiErrorMessage } from '@/lib/api/http';
import Alert from '@/components/ui/Alert';
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
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyzeQuizSolution({ attemptId, questionId });
      setAnalysis(data.analysis);
    } catch (err) {
      setError(getApiErrorMessage(err, t('quizResult.solutionAnalysisFailed')));
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

      {error && (
        <div className="mt-2 space-y-2">
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
            className="relative top-0 right-0 left-0 translate-x-0 w-full z-10"
          />
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="text-sm font-medium text-[var(--color-primary)] hover:underline disabled:opacity-60"
          >
            {t('quizResult.analyzeSolutionRetry')}
          </button>
        </div>
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
