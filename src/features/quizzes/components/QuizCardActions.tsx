'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Play, RotateCcw, CheckCircle, Trophy } from 'lucide-react';
import { Loader } from '@/components/ui/Loader';
import { cn } from '@/lib/utils';

interface Props {
  type: 'available' | 'attempted' | 'in_progress';
  isCompact: boolean;
  isLoading: boolean;
  onStart: () => void;
  onContinue: () => void;
  onReview: () => void;
  onRetake: () => void;
  onViewLeaderboard: () => void;
}

export function QuizCardActions({
  type,
  isCompact,
  isLoading,
  onStart,
  onContinue,
  onReview,
  onRetake,
  onViewLeaderboard,
}: Props) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        'flex flex-col gap-1.5',
        isCompact ? '' : 'mt-auto min-h-[6.5rem] justify-end'
      )}
    >
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onViewLeaderboard}
        className="flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--color-surface-muted)] px-3 py-2 text-xs sm:text-sm font-medium text-[var(--color-foreground)] transition-all hover:bg-[var(--color-surface-muted)]/80"
      >
        <Trophy className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{t('quiz.viewLeaderboard')}</span>
      </motion.button>

      {type === 'available' ? (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          disabled={isLoading}
          className="gradient-bg flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <Loader size="sm" />
          ) : (
            <>
              <Play className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t('quiz.startQuiz')}</span>
            </>
          )}
        </motion.button>
      ) : type === 'in_progress' ? (
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={onContinue}
          className="gradient-bg flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:opacity-90"
        >
          <Play className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{t('courses.continue')}</span>
        </motion.button>
      ) : (
        <div className="flex flex-col gap-1.5 sm:flex-row">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReview}
            className="gradient-bg flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-white transition-all hover:opacity-90"
          >
            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{t('quiz.review')}</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetake}
            disabled={isLoading}
            className="flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--primary-border)] bg-transparent px-3 py-2 text-xs sm:text-sm font-semibold text-[var(--primary)] transition-all hover:bg-[var(--primary-soft)] disabled:opacity-50 sm:flex-none"
          >
            {isLoading ? (
              <Loader size="sm" />
            ) : (
              <>
                <RotateCcw className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{t('quiz.retake')}</span>
              </>
            )}
          </motion.button>
        </div>
      )}
    </div>
  );
}
