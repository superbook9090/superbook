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
    <div className="antigravity-glass rounded-3xl p-5 sm:p-6 mb-4 sm:mb-6 shadow-md border border-[var(--border)]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
        <div className="min-w-0">
          <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)] line-clamp-2">
            {attempt.quiz.title}
          </h1>
        </div>
        <div
          className={`shrink-0 rounded-2xl border px-4 py-2.5 text-right transition-all duration-300 ${
            timeRemaining < 60
              ? 'border-[var(--error)] bg-[var(--error-light)] text-[var(--error)] shadow-[0_0_15px_var(--error)] animate-pulse'
              : 'border-[var(--student-primary)]/30 bg-[var(--student-soft)]/40 text-[var(--color-foreground)] shadow-xs'
          }`}
        >
          <p className="text-[10px] sm:text-xs uppercase font-bold tracking-wider text-[var(--color-muted-foreground)]">
            {t('quiz.timeRemaining')}
          </p>
          <p className="text-xl sm:text-2xl font-black font-mono tabular-nums text-[var(--student-primary)]">
            {formatTime(timeRemaining)}
          </p>
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
