'use client';

import React from 'react';
import { X, CheckCircle2, Clock, Calendar, HelpCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import Button from '@/components/ui/Button';
import type { CourseProgressAttempt } from '../../types';

interface StudentQuizAttemptsModalProps {
  isOpen: boolean;
  courseTitle: string;
  attempts: CourseProgressAttempt[];
  onClose: () => void;
}

export function StudentQuizAttemptsModal({
  isOpen,
  courseTitle,
  attempts,
  onClose,
}: StudentQuizAttemptsModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card-surface w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[var(--student-primary)]" />
              <span>{t('progress.quizAttempts')}</span>
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] line-clamp-1 mt-0.5">
              {courseTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] touch-target"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Attempts List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {attempts.length === 0 ? (
            <div className="text-center py-10">
              <HelpCircle className="w-10 h-10 text-[var(--color-muted)] mx-auto mb-2 opacity-50" />
              <p className="text-sm text-[var(--color-muted-foreground)]">{t('progress.noData')}</p>
            </div>
          ) : (
            attempts.map((attempt) => {
              const isPassing = attempt.score >= 70;
              const isAverage = attempt.score >= 50 && attempt.score < 70;

              return (
                <div
                  key={attempt._id}
                  className="bg-[var(--color-surface-muted)] p-3.5 sm:p-4 rounded-xl border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[var(--color-foreground)]">
                        {attempt.quizTitle}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--card-solid)] text-[var(--color-muted-foreground)] border border-[var(--border)]">
                        #{attempt.attemptNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--color-muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(attempt.submittedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatSeconds(attempt.timeTaken)}
                      </span>
                    </div>
                  </div>

                  {/* Score pill */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                    <span className="text-xs text-[var(--color-muted-foreground)]">
                      {attempt.correctCount}/{attempt.totalQuestions} {t('progress.correct')}
                    </span>
                    <span
                      className={`text-base font-bold px-3 py-1 rounded-lg flex items-center gap-1 ${
                        isPassing
                          ? 'bg-[var(--success-light)] text-[var(--success)]'
                          : isAverage
                          ? 'bg-[var(--warning-light)] text-[var(--warning)]'
                          : 'bg-[var(--color-error-light)] text-[var(--color-error)]'
                      }`}
                    >
                      {isPassing && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {attempt.score}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[var(--color-surface-muted)] border-t border-[var(--border)] flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            {t('progress.close')}
          </Button>
        </div>
      </div>
    </div>
  );
}
