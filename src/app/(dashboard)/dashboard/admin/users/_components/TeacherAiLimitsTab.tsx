'use client';

import React from 'react';
import { Sparkles, Zap, RotateCcw, Plus, Minus, Info } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface TeacherAiLimitsTabProps {
  limitsForm: {
    aiQuizGenerations?: string;
    aiQuizMaxQuestions?: string;
  };
  globalGenerationsLimit: number;
  globalMaxQuestions: number;
  usedGenerationsCount?: number;
  onLimitsChange: (field: 'aiQuizGenerations' | 'aiQuizMaxQuestions', value: string) => void;
}

export function TeacherAiLimitsTab({
  limitsForm,
  globalGenerationsLimit,
  globalMaxQuestions,
  usedGenerationsCount,
  onLimitsChange,
}: TeacherAiLimitsTabProps) {
  const { t } = useTranslation();

  const handleStep = (
    field: 'aiQuizGenerations' | 'aiQuizMaxQuestions',
    delta: number,
    defaultVal: number,
    max?: number
  ) => {
    const currentStr = limitsForm[field];
    const currentVal = currentStr ? parseInt(currentStr, 10) : defaultVal;
    let nextVal = Math.max(1, currentVal + delta);
    if (max && nextVal > max) nextVal = max;
    onLimitsChange(field, String(nextVal));
  };

  const isGenCustom = Boolean(limitsForm.aiQuizGenerations && limitsForm.aiQuizGenerations.trim() !== '');
  const isMaxQCustom = Boolean(limitsForm.aiQuizMaxQuestions && limitsForm.aiQuizMaxQuestions.trim() !== '');

  return (
    <div className="flex flex-col gap-3.5 rounded-xl bg-gradient-to-br from-[var(--primary-soft)]/20 via-[var(--card-solid)] to-[var(--card-solid)] border border-[var(--color-primary)]/25 p-4 shadow-xs">
      {/* Header with Usage tracker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-[var(--color-primary)] text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h5 className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] leading-tight">
              {t('adminUsers.aiQuotasTitle')}
            </h5>
            <p className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">
              {t('adminUsers.aiQuotasDesc')}
            </p>
          </div>
        </div>

        {usedGenerationsCount !== undefined && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20 self-start sm:self-center shrink-0">
            <Sparkles className="w-3 h-3" />
            <span>{t('adminUsers.usedGenerations')}: {usedGenerationsCount}</span>
          </span>
        )}
      </div>

      {/* 2 Control Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Card 1: Total Generations Quota */}
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-[var(--color-surface)]/70 border border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-foreground)] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[var(--color-primary)]" />
              {t('adminUsers.aiQuizGenerations')}
            </span>
            {isGenCustom ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {limitsForm.aiQuizGenerations} {t('adminUsers.customOverride')}
              </span>
            ) : (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)]">
                {t('adminUsers.globalDefaultBadge')}: {globalGenerationsLimit}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {t('adminUsers.totalAiRuns')}
          </p>

          {/* Stepper + Input */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--color-surface)] shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => handleStep('aiQuizGenerations', -1, globalGenerationsLimit)}
                className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min="1"
                value={limitsForm.aiQuizGenerations || ''}
                onChange={(e) => onLimitsChange('aiQuizGenerations', e.target.value)}
                placeholder={String(globalGenerationsLimit)}
                className="w-16 text-center text-xs sm:text-sm font-semibold text-[var(--color-foreground)] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => handleStep('aiQuizGenerations', 1, globalGenerationsLimit)}
                className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {isGenCustom && (
              <button
                type="button"
                onClick={() => onLimitsChange('aiQuizGenerations', '')}
                title={t('adminUsers.resetToGlobal')}
                className="p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] border border-transparent hover:border-[var(--border)] transition-colors text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] text-[var(--color-muted-foreground)]">
              {t('adminUsers.preset')}:
            </span>
            <button
              type="button"
              onClick={() => onLimitsChange('aiQuizGenerations', '')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors border ${
                !limitsForm.aiQuizGenerations
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-muted-strong)] text-[var(--color-foreground)] border-[var(--border)]'
              }`}
            >
              Default ({globalGenerationsLimit})
            </button>
            {[10, 25, 50, 100].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onLimitsChange('aiQuizGenerations', String(num))}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors border ${
                  limitsForm.aiQuizGenerations === String(num)
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-muted-strong)] text-[var(--color-foreground)] border-[var(--border)]'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        {/* Card 2: Max Questions per Single Run */}
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-[var(--color-surface)]/70 border border-[var(--border)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-foreground)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
              {t('adminUsers.aiQuizMaxQuestions')}
            </span>
            {isMaxQCustom ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {limitsForm.aiQuizMaxQuestions} {t('adminUsers.customOverride')}
              </span>
            ) : (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)]">
                {t('adminUsers.globalDefaultBadge')}: {globalMaxQuestions}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {t('adminUsers.maxQuestionsPerRun')}
          </p>

          {/* Stepper + Input */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--color-surface)] shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => handleStep('aiQuizMaxQuestions', -1, globalMaxQuestions, 50)}
                className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <input
                type="number"
                min="1"
                max="50"
                value={limitsForm.aiQuizMaxQuestions || ''}
                onChange={(e) => onLimitsChange('aiQuizMaxQuestions', e.target.value)}
                placeholder={String(globalMaxQuestions)}
                className="w-16 text-center text-xs sm:text-sm font-semibold text-[var(--color-foreground)] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => handleStep('aiQuizMaxQuestions', 1, globalMaxQuestions, 50)}
                className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {isMaxQCustom && (
              <button
                type="button"
                onClick={() => onLimitsChange('aiQuizMaxQuestions', '')}
                title={t('adminUsers.resetToGlobal')}
                className="p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] border border-transparent hover:border-[var(--border)] transition-colors text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] text-[var(--color-muted-foreground)]">
              {t('adminUsers.preset')}:
            </span>
            <button
              type="button"
              onClick={() => onLimitsChange('aiQuizMaxQuestions', '')}
              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors border ${
                !limitsForm.aiQuizMaxQuestions
                  ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                  : 'bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-muted-strong)] text-[var(--color-foreground)] border-[var(--border)]'
              }`}
            >
              Default ({globalMaxQuestions})
            </button>
            {[15, 20, 25, 30].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => onLimitsChange('aiQuizMaxQuestions', String(num))}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors border ${
                  limitsForm.aiQuizMaxQuestions === String(num)
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-muted-strong)] text-[var(--color-foreground)] border-[var(--border)]'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="flex items-start gap-1.5 pt-1 text-[10px] text-[var(--color-muted-foreground)]">
            <Info className="w-3 h-3 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <span>{t('adminUsers.extraQuestionsHighlighted')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
