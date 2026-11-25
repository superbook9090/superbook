'use client';

import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, BookOpen, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

export interface MistakeItem {
  _id: string;
  question: string;
  sourceType: 'contest' | 'quiz';
  sourceTitle?: string;
  prompt: string;
  options: string[];
  correctOption: number;
  selectedOption: number;
  explanation?: string;
  mastered: boolean;
  reviewedCount: number;
  updatedAt: string;
}

interface MistakeCardProps {
  item: MistakeItem;
  index: number;
  onToggleMastered: (id: string, nextStatus: boolean) => Promise<void>;
}

export function MistakeCard({ item, index, onToggleMastered }: MistakeCardProps) {
  const { t } = useTranslation();
  const [updating, setUpdating] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const optionLetters = ['A', 'B', 'C', 'D'];

  const handleToggle = async () => {
    setUpdating(true);
    try {
      await onToggleMastered(item._id, !item.mastered);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <article
      className={cn(
        'student-card p-4 sm:p-5',
        item.mastered && 'border-[var(--success)]/35 opacity-85'
      )}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]/70 flex items-center justify-center font-bold text-xs tabular-nums text-[var(--color-foreground)] shrink-0">
            {index + 1}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-border)] truncate max-w-[240px]">
            <BookOpen className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {item.sourceTitle ||
                (item.sourceType === 'contest'
                  ? t('studentUi.contestSource')
                  : t('studentUi.quizSource'))}
            </span>
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={updating}
          className={cn(
            'inline-flex items-center gap-1.5 min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer focus-ring disabled:opacity-50',
            item.mastered
              ? 'bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/30 hover:opacity-90'
              : 'bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--success)] hover:border-[var(--success)]/35 border-[var(--border)]'
          )}
        >
          <CheckCircle2 className={cn('w-3.5 h-3.5', item.mastered && 'fill-current')} />
          <span>{item.mastered ? t('studentUi.mastered') : t('studentUi.markMastered')}</span>
        </button>
      </div>

      {/* Prompt */}
      <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] mb-3.5 leading-relaxed">
        {item.prompt}
      </h3>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {item.options.map((opt, oIdx) => {
          const isCorrect = oIdx === item.correctOption;
          const isSelected = oIdx === item.selectedOption;

          return (
            <div
              key={oIdx}
              className={cn(
                'flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl border text-xs sm:text-sm',
                isCorrect
                  ? 'bg-[var(--success-light)] border-[var(--success)]/40 text-[var(--success)] font-semibold'
                  : isSelected
                    ? 'bg-[var(--error-light)] border-[var(--error)]/35 text-[var(--error)] line-through'
                    : 'bg-[var(--surface-muted)]/60 border-[var(--border)]/80 text-[var(--color-foreground)]'
              )}
            >
              <span className="font-bold shrink-0">{optionLetters[oIdx] ?? oIdx + 1}.</span>
              <span className="flex-1 break-words">{opt}</span>
              {isCorrect && (
                <span className="text-[10px] font-bold uppercase tracking-wide shrink-0">
                  {t('studentUi.correctLabel')} ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Explanation Box */}
      {item.explanation && (
        <div className="mt-3.5 pt-3 border-t border-[var(--border)]/70">
          <button
            type="button"
            onClick={() => setShowExplanation((prev) => !prev)}
            aria-expanded={showExplanation}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--student-primary)] hover:opacity-80 transition-opacity cursor-pointer py-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>
              {showExplanation ? t('studentUi.hideExplanation') : t('studentUi.showExplanation')}
            </span>
            <ChevronDown
              className={cn('w-3.5 h-3.5 transition-transform', showExplanation && 'rotate-180')}
            />
          </button>

          {showExplanation && (
            <div className="mt-2 p-3 rounded-xl bg-[var(--surface-muted)]/70 border border-[var(--border)]/80 text-xs sm:text-sm text-[var(--color-muted-foreground)] leading-relaxed space-y-1">
              <span className="font-bold text-[var(--color-foreground)] block text-xs">
                {t('studentUi.explanation')}:
              </span>
              <p>{item.explanation}</p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export default MistakeCard;
