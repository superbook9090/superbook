'use client';

import React, { useState } from 'react';
import { CheckCircle2, HelpCircle, BookOpen } from 'lucide-react';

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
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
        item.mastered
          ? 'bg-[var(--card-solid)] border-emerald-500/30 opacity-75'
          : 'bg-[var(--card-solid)] border-[var(--border)] hover:border-[var(--primary)]/50'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-[var(--color-surface-muted)] flex items-center justify-center font-bold text-xs text-[var(--color-foreground)]">
            {index + 1}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--student-soft)] text-[var(--student-primary)]">
            <BookOpen className="w-3 h-3" />
            {item.sourceTitle || (item.sourceType === 'contest' ? 'Contest' : 'Practice Quiz')}
          </span>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={updating}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            item.mastered
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] hover:text-emerald-500 hover:border-emerald-500/30 border border-[var(--border)]'
          }`}
        >
          <CheckCircle2 className={`w-3.5 h-3.5 ${item.mastered ? 'fill-current' : ''}`} />
          <span>{item.mastered ? 'Mastered' : 'Mark Mastered'}</span>
        </button>
      </div>

      {/* Prompt */}
      <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] mb-3 leading-relaxed">
        {item.prompt}
      </h3>

      {/* Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {item.options.map((opt, oIdx) => {
          const isCorrect = oIdx === item.correctOption;
          const isSelected = oIdx === item.selectedOption;

          let badgeStyle =
            'bg-[var(--surface-muted)]/40 border-[var(--border)] text-[var(--color-foreground)]';
          if (isCorrect) {
            badgeStyle =
              'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold';
          } else if (isSelected) {
            badgeStyle =
              'bg-red-500/10 border-red-500/40 text-red-700 dark:text-red-300 line-through';
          }

          return (
            <div
              key={oIdx}
              className={`flex items-start gap-2 p-2.5 rounded-xl border text-xs sm:text-sm ${badgeStyle}`}
            >
              <span className="font-bold shrink-0">({optionLetters[oIdx]})</span>
              <span className="flex-1">{opt}</span>
              {isCorrect && (
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                  Correct ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Explanation Box */}
      {item.explanation && (
        <div className="mt-2 pt-2 border-t border-[var(--border)]">
          {showExplanation ? (
            <div className="p-3 rounded-xl bg-[var(--surface-muted)]/50 border border-[var(--border)] text-xs text-[var(--color-muted-foreground)] leading-relaxed space-y-1">
              <span className="font-bold text-[var(--color-foreground)] block">
                Explanation:
              </span>
              <p>{item.explanation}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowExplanation(true)}
              className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Show Detailed Explanation</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MistakeCard;
