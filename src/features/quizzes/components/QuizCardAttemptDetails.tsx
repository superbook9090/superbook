'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime, formatDuration } from '@/lib/dateUtils';
import { CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface QuizAttemptInfo {
  _id: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  status: string;
  attemptNumber: number;
  submittedAt?: string;
  startedAt: string;
}

interface Props {
  type: 'attempted' | 'in_progress';
  attempt: QuizAttemptInfo;
}

export function QuizCardAttemptDetails({ type, attempt }: Props) {
  const { t } = useTranslation();

  const getScoreVariant = (score: number) => {
    if (score >= 70) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  if (type === 'attempted') {
    return (
      <div className="rounded-lg bg-[var(--color-surface-muted)]/60 p-2.5 sm:p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <Badge variant={getScoreVariant(attempt.score)} size="sm">
            {attempt.score}% {t('quiz.quizScore')}
          </Badge>
          <span className="shrink-0 text-xs text-[var(--color-muted-foreground)]">
            {t('quiz.attempt')}
            {attempt.attemptNumber}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1.5 text-xs sm:text-sm sm:grid-cols-2 sm:gap-3">
          <div className="flex min-w-0 items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 shrink-0 text-[var(--color-success)]" />
            <span className="truncate text-[var(--color-muted-foreground)]">
              {attempt.correctCount}/{attempt.totalQuestions} {t('quiz.correct')}
            </span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--color-info)]" />
            <span className="truncate text-[var(--color-muted-foreground)]">
              {formatDuration(attempt.timeTaken)}
            </span>
          </div>
        </div>
        {attempt.submittedAt && (
          <p className="mt-1.5 truncate text-[11px] text-[var(--color-muted-foreground)]">
            {t('quiz.completed')} {formatDateTime(attempt.submittedAt)}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning-light)] p-2.5 sm:p-3">
      <Badge variant="warning" size="sm">
        {t('courses.inProgress')}
      </Badge>
      <p className="mt-1.5 truncate text-xs text-[var(--color-muted-foreground)]">
        {t('quiz.started')} {formatDateTime(attempt.startedAt)}
      </p>
    </div>
  );
}
