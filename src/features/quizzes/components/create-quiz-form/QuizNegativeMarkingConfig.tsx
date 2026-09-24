'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface QuizNegativeMarkingConfigProps {
  enableNegativeMarking?: boolean;
  negativeMarks?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function QuizNegativeMarkingConfig({
  enableNegativeMarking = false,
  negativeMarks = '0.25',
  onChange,
}: QuizNegativeMarkingConfigProps) {
  const { t } = useTranslation();

  return (
    <div className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor="enableNegativeMarking" className="text-sm font-semibold text-[var(--color-foreground)] flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              id="enableNegativeMarking"
              name="enableNegativeMarking"
              checked={enableNegativeMarking}
              onChange={onChange}
              className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)] rounded cursor-pointer"
            />
            <span>{t('createQuizForm.enableNegativeMarking') || 'Enable Negative Marking'}</span>
          </label>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 ml-6">
            {t('createQuizForm.negativeMarkingDesc') || 'Deduct marks for incorrect answers to simulate competitive exam grading.'}
          </p>
        </div>
      </div>

      {enableNegativeMarking && (
        <div className="pt-2 border-t border-[var(--color-border)] space-y-3 ml-6">
          <div>
            <label className="block text-xs font-semibold text-[var(--color-foreground)] mb-1">
              {t('createQuizForm.negativeMarks') || 'Penalty per incorrect answer'}
            </label>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {[
                { label: t('createQuizForm.negativeMarksPresetQuarter') || '1/4 (-0.25)', value: '0.25' },
                { label: t('createQuizForm.negativeMarksPresetThird') || '1/3 (-0.33)', value: '0.33' },
                { label: t('createQuizForm.negativeMarksPresetHalf') || '1/2 (-0.5)', value: '0.5' },
                { label: t('createQuizForm.negativeMarksPresetOne') || '1 (-1.0)', value: '1' },
              ].map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    onChange({
                      target: { name: 'negativeMarks', value: preset.value, type: 'text' },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                    negativeMarks === preset.value
                      ? 'bg-[var(--color-primary)] text-white border-transparent'
                      : 'bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border-[var(--color-border)] hover:bg-[var(--color-accent)]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <input
              type="number"
              step="0.01"
              min="0"
              max="10"
              name="negativeMarks"
              value={negativeMarks}
              onChange={onChange}
              placeholder="0.25"
              className="w-32 px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] focus:ring-1 focus:ring-[var(--color-primary)]"
            />
            <span className="text-[11px] text-[var(--color-muted-foreground)] block mt-1">
              {t('createQuizForm.negativeMarksHint') || 'Unattempted / skipped questions receive 0 deduction.'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
