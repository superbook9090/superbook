'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

export type SolutionFilter = 'all' | 'correct' | 'incorrect' | 'unattempted';

export function QuizSolutionsFilter({
  value,
  onChange,
  counts,
}: {
  value: SolutionFilter;
  onChange: (filter: SolutionFilter) => void;
  counts: { all: number; correct: number; incorrect: number; unattempted: number };
}) {
  const { t } = useTranslation();

  const filters: { id: SolutionFilter; label: string; count: number }[] = [
    { id: 'all', label: t('quizResult.filterAll'), count: counts.all },
    { id: 'correct', label: t('quizResult.filterCorrect'), count: counts.correct },
    { id: 'incorrect', label: t('quizResult.filterIncorrect'), count: counts.incorrect },
    { id: 'unattempted', label: t('quizResult.filterUnattempted'), count: counts.unattempted },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter.id}
          type="button"
          onClick={() => onChange(filter.id)}
          className={cn(
            'shrink-0 min-h-[40px] px-4 py-2 rounded-full text-sm font-medium border transition-colors',
            value === filter.id
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
              : 'bg-[var(--card-solid)] text-[var(--color-foreground)] border-[var(--color-border)] hover:border-[var(--color-primary)]/40'
          )}
        >
          {filter.label}
          <span className="ml-1.5 opacity-80">({filter.count})</span>
        </button>
      ))}
    </div>
  );
}
