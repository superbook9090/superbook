import React from 'react';
import { LazyQuizQuestionProgress } from '@/lib/lazy';
import type { Attempt, Question } from './types';

type Props = {
  attempt: Attempt;
  timeRemaining: number;
  formatTime: (seconds: number) => string;
  questions: Question[];
  currentQuestion: number;
  answeredIds: Set<string>;
  questionIds: string[];
  setCurrentQuestion: (index: number) => void;
  t: (key: string) => string;
};

export function QuizTakeHeader({
  attempt,
  timeRemaining,
  formatTime,
  questions,
  currentQuestion,
  answeredIds,
  questionIds,
  setCurrentQuestion,
  t,
}: Props) {
  return (
    <div className="card-surface card-body mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)] line-clamp-2">
            {attempt.quiz.title}
          </h1>
        </div>
        <div
          className={`shrink-0 rounded-xl border px-4 py-2 text-right ${
            timeRemaining < 60
              ? 'border-[var(--error)]/30 bg-[var(--error-light)] text-[var(--error)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 text-[var(--color-foreground)]'
          }`}
        >
          <p className="text-[10px] sm:text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {t('quiz.timeRemaining')}
          </p>
          <p className="text-xl sm:text-2xl font-bold font-mono tabular-nums">{formatTime(timeRemaining)}</p>
        </div>
      </div>

      <LazyQuizQuestionProgress
        total={questions.length}
        currentIndex={currentQuestion}
        answeredIds={answeredIds}
        questionIds={questionIds}
        onSelect={setCurrentQuestion}
      />
    </div>
  );
}
