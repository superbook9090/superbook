'use client';

import { Target, ChevronRight, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

type Props = {
  title: string;
  timeLimit: number;
  questionCount?: number;
  status: 'available' | 'in_progress' | 'completed';
  score?: number;
  isLoading?: boolean;
  onAction: () => void;
};

export default function CurriculumQuizRow({
  title,
  timeLimit,
  questionCount,
  status,
  score,
  isLoading,
  onAction,
}: Props) {
  const { t } = useTranslation();

  const actionLabel =
    status === 'completed'
      ? t('quiz.review')
      : status === 'in_progress'
        ? t('courses.continue')
        : t('quiz.startQuiz');

  return (
    <button
      type="button"
      onClick={onAction}
      disabled={isLoading}
      className="flex w-full items-center justify-between gap-4 p-4 text-left hover:bg-[var(--primary-soft)] transition-colors disabled:opacity-60"
    >
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
          <Target className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-[var(--color-foreground)]">{title}</p>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {questionCount != null ? `${questionCount} ${t('quiz.questions')}` : t('quiz.questions')}
            {` · ${timeLimit} ${t('quiz.min')}`}
            {status === 'completed' && score != null ? ` · ${score}%` : ''}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span
          className={cn(
            'text-xs font-semibold',
            status === 'completed'
              ? 'text-[var(--color-success)]'
              : status === 'in_progress'
                ? 'text-[var(--color-warning)]'
                : 'text-[var(--primary)]'
          )}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : actionLabel}
        </span>
        <ChevronRight className="h-4 w-4 text-[var(--color-muted-foreground)]" />
      </div>
    </button>
  );
}
