'use client';

import React from 'react';
import { Lock, CheckCircle2, XCircle, Clock, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ContestCountdown } from './ContestCountdown';
import type { ContestQuestionReview } from '@/lib/api/contests';

interface ContestSolutionsReviewProps {
  isLocked: boolean;
  solutionsReleaseAt?: string;
  questionReviews?: ContestQuestionReview[];
  message?: string;
}

export function ContestSolutionsReview({
  isLocked,
  solutionsReleaseAt,
  questionReviews = [],
  message,
}: ContestSolutionsReviewProps) {
  const { t } = useTranslation();

  if (isLocked && solutionsReleaseAt) {
    return (
      <div className="p-6 sm:p-10 rounded-2xl bg-gradient-to-b from-[var(--color-surface-muted)] to-[var(--card-solid)] border border-[var(--border)] shadow-sm text-center flex flex-col items-center gap-4">
        <div className="p-3.5 rounded-2xl bg-[var(--warning-light)] text-[var(--warning)] shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
            {t('contest.solutionsLocked') || 'Answers & Detailed Review Locked'}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] max-w-md mt-1">
            {message ||
              t('contest.solutionsLockedDesc') ||
              'To ensure fairness, correct answers and detailed explanations will be unlocked automatically at the scheduled release time.'}
          </p>
        </div>

        <div className="pt-2">
          <ContestCountdown
            targetDate={solutionsReleaseAt}
            label={t('contest.solutionsUnlockIn') || 'Solutions Unlock In'}
            type="solutions_in"
          />
        </div>
      </div>
    );
  }

  if (questionReviews.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-[var(--color-muted-foreground)]">
        {t('contest.noReviewAvailable') || 'No solution review data available.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--success)]" />
          <h3 className="text-sm font-bold text-[var(--color-foreground)]">
            {t('contest.solutionAndExplanation') || 'Solutions & Explanations'}
          </h3>
        </div>
        <span className="text-xs text-[var(--color-muted)] font-medium">
          {questionReviews.length} {t('common.questions') || 'Questions'}
        </span>
      </div>

      <div className="space-y-4">
        {questionReviews.map((q, qIndex) => {
          const isCorrect = q.isCorrect;
          const isSkipped = q.selectedOption === -1;

          return (
            <div
              key={q.questionId || qIndex}
              className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-all ${
                isCorrect
                  ? 'bg-[var(--card-solid)] border-[var(--success)]/40 ring-1 ring-[var(--success)]/20'
                  : isSkipped
                  ? 'bg-[var(--card-solid)] border-[var(--border)]'
                  : 'bg-[var(--card-solid)] border-[var(--error)]/40 ring-1 ring-[var(--error)]/20'
              }`}
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[var(--color-surface-muted)] flex items-center justify-center font-bold text-xs text-[var(--color-foreground)]">
                    {qIndex + 1}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
                      isCorrect
                        ? 'bg-[var(--success-light)] text-[var(--success)]'
                        : isSkipped
                        ? 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                        : 'bg-[var(--error-light)] text-[var(--error)]'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t('contest.correctPoints', { count: q.pointsEarned }) || `Correct (+${q.pointsEarned} pts)`}</span>
                      </>
                    ) : isSkipped ? (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{t('contest.skippedPoints') || 'Skipped (0 pts)'}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{t('contest.incorrectPoints') || 'Incorrect (0 pts)'}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <p className="text-sm sm:text-base font-semibold text-[var(--color-foreground)] mb-4">
                {q.prompt}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {q.options.map((opt, optIndex) => {
                  const isThisCorrect = optIndex === q.correctOption;
                  const isThisSelected = optIndex === q.selectedOption;

                  let optClass =
                    'bg-[var(--color-surface-muted)] border-[var(--border)] text-[var(--color-foreground)]';
                  if (isThisCorrect) {
                    optClass =
                      'bg-[var(--success-light)] border-[var(--success)]/50 text-[var(--success-foreground)] font-semibold';
                  } else if (isThisSelected && !isThisCorrect) {
                    optClass =
                      'bg-[var(--error-light)] border-[var(--error)]/50 text-[var(--error-foreground)] font-medium line-through';
                  }

                  return (
                    <div
                      key={optIndex}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm transition-colors ${optClass}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-[var(--card-solid)] border border-[var(--border)] flex items-center justify-center font-mono text-[11px] font-bold text-[var(--color-foreground)] shrink-0">
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>

                      <div className="shrink-0 text-xs font-bold">
                        {isThisCorrect && (
                          <span className="text-[var(--success)] flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            {t('contest.correctAnswer') || 'Correct Answer'}
                          </span>
                        )}
                        {isThisSelected && !isThisCorrect && (
                          <span className="text-[var(--error)] flex items-center gap-1">
                            <XCircle className="w-4 h-4" />
                            {t('contest.yourAnswer') || 'Your Answer'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
