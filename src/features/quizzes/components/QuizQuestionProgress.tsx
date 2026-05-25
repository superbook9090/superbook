'use client';

import { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

export type QuestionProgressState = 'current' | 'answered' | 'unanswered';

export function getQuestionProgressState(
  index: number,
  currentIndex: number,
  isAnswered: boolean
): QuestionProgressState {
  if (index === currentIndex) return 'current';
  if (isAnswered) return 'answered';
  return 'unanswered';
}

function getVisibleQuestionCount(width: number): number {
  if (width >= 1024) return 9;
  if (width >= 640) return 7;
  return 5;
}

export function QuizQuestionProgress({
  total,
  currentIndex,
  answeredIds,
  questionIds,
  onSelect,
  className,
}: {
  total: number;
  currentIndex: number;
  answeredIds: Set<string>;
  questionIds: string[];
  onSelect: (index: number) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const [windowStart, setWindowStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);

  const answeredCount = questionIds.filter((id) => answeredIds.has(id)).length;
  const remainingCount = total - answeredCount;
  const progressPercent = total > 0 ? (answeredCount / total) * 100 : 0;
  const positionPercent = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  const maxWindowStart = Math.max(0, total - visibleCount);
  const canScrollLeft = windowStart > 0;
  const canScrollRight = windowStart < maxWindowStart;
  const visibleQuestions = questionIds.slice(windowStart, windowStart + visibleCount);

  useEffect(() => {
    const updateVisibleCount = () => {
      setVisibleCount(getVisibleQuestionCount(window.innerWidth));
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  useEffect(() => {
    setWindowStart((prev) => {
      if (currentIndex < prev) return currentIndex;
      if (currentIndex >= prev + visibleCount) {
        return Math.min(currentIndex - visibleCount + 1, maxWindowStart);
      }
      return Math.min(prev, maxWindowStart);
    });
  }, [currentIndex, visibleCount, maxWindowStart]);

  const scrollWindow = (direction: -1 | 1) => {
    setWindowStart((prev) => {
      const next = prev + direction;
      return Math.max(0, Math.min(next, maxWindowStart));
    });
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--success)]/15 text-[var(--success)] px-2.5 py-1 font-medium">
          <span className="w-2 h-2 rounded-full bg-[var(--success)]" />
          {answeredCount} {t('quiz.answered')}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] px-2.5 py-1 font-medium">
          <span className="w-2 h-2 rounded-full bg-[var(--color-border)]" />
          {remainingCount} {t('quiz.remaining')}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/15 text-[var(--color-primary)] px-2.5 py-1 font-medium sm:ml-auto">
          {t('quiz.question')} {currentIndex + 1}/{total}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] sm:text-xs text-[var(--color-muted-foreground)] px-0.5">
          <span>{t('quiz.progressAnswered')}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--success)] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] sm:text-xs text-[var(--color-muted-foreground)] px-0.5">
          <span>{t('quiz.progressPosition')}</span>
          <span>{Math.round(positionPercent)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[var(--color-surface-muted)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
            style={{ width: `${positionPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => scrollWindow(-1)}
          disabled={!canScrollLeft}
          aria-label={t('quiz.showPreviousQuestions')}
          className={cn(
            'shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 transition-all',
            canScrollLeft
              ? 'border-[var(--color-border)] bg-[var(--card-solid)] text-[var(--color-foreground)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)]'
              : 'border-transparent bg-[var(--color-surface-muted)]/50 text-[var(--color-muted-foreground)]/40 cursor-not-allowed'
          )}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div
          className="flex flex-1 gap-1.5 sm:gap-2 justify-center min-w-0"
          role="tablist"
          aria-label={t('quiz.jumpToQuestion')}
        >
          {visibleQuestions.map((id, localIndex) => {
            const index = windowStart + localIndex;
            const state = getQuestionProgressState(index, currentIndex, answeredIds.has(id));
            const isCurrent = state === 'current';
            const isAnswered = state === 'answered';

            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isCurrent}
                aria-label={`${t('quiz.question')} ${index + 1}`}
                onClick={() => onSelect(index)}
                className={cn(
                  'relative flex-1 min-w-0 max-w-[44px] h-10 sm:h-9 rounded-xl text-sm font-semibold transition-all border-2',
                  isCurrent &&
                    'border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-sm scale-105 z-10',
                  isAnswered &&
                    !isCurrent &&
                    'border-[var(--success)]/40 bg-[var(--success)]/15 text-[var(--success)] hover:bg-[var(--success)]/25',
                  !isCurrent &&
                    !isAnswered &&
                    'border-[var(--color-border)] bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-foreground)]'
                )}
              >
                {isAnswered && !isCurrent ? (
                  <span className="flex items-center justify-center gap-0.5">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline truncate">{index + 1}</span>
                  </span>
                ) : (
                  index + 1
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scrollWindow(1)}
          disabled={!canScrollRight}
          aria-label={t('quiz.showNextQuestions')}
          className={cn(
            'shrink-0 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 transition-all',
            canScrollRight
              ? 'border-[var(--color-border)] bg-[var(--card-solid)] text-[var(--color-foreground)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-primary)]'
              : 'border-transparent bg-[var(--color-surface-muted)]/50 text-[var(--color-muted-foreground)]/40 cursor-not-allowed'
          )}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-3 text-[10px] sm:text-xs text-[var(--color-muted-foreground)]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10" />
          {t('quiz.progressCurrent')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md border-2 border-[var(--success)]/40 bg-[var(--success)]/15" />
          {t('quiz.answered')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md border-2 border-[var(--color-border)] bg-[var(--card-solid)]" />
          {t('quiz.progressUnanswered')}
        </span>
      </div>
    </div>
  );
}
