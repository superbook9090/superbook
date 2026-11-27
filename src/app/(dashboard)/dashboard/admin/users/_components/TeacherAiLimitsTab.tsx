'use client';

import React from 'react';
import { Sparkles, Zap, RotateCcw, Plus, Minus, Info } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface TeacherAiLimitsTabProps {
  limitsForm: {
    aiQuizGenerations?: string;
    aiQuizMaxQuestions?: string;
  };
  orgMaxLimits?: {
    aiQuizGenerations?: number;
    aiQuizMaxQuestions?: number;
  };
  isSuperAdmin?: boolean;
  globalGenerationsLimit: number;
  globalMaxQuestions: number;
  usedGenerationsCount?: number;
  onLimitsChange: (field: 'aiQuizGenerations' | 'aiQuizMaxQuestions', value: string) => void;
}

export function TeacherAiLimitsTab({
  limitsForm,
  orgMaxLimits,
  isSuperAdmin = true,
  globalGenerationsLimit,
  globalMaxQuestions,
  usedGenerationsCount,
  onLimitsChange,
}: TeacherAiLimitsTabProps) {
  const { t } = useTranslation();

  const genMaxCap = isSuperAdmin ? undefined : orgMaxLimits?.aiQuizGenerations;
  const maxQCap = isSuperAdmin ? 50 : Math.min(50, orgMaxLimits?.aiQuizMaxQuestions ?? 0);

  const showGenCard = isSuperAdmin || (typeof genMaxCap === 'number' && genMaxCap >= 1);
  const showMaxQCard = isSuperAdmin || maxQCap >= 1;

  const clampValue = (raw: string, max?: number) => {
    if (!raw.trim()) return '';
    const parsed = parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 1) return '1';
    if (max !== undefined && parsed > max) return String(max);
    return String(parsed);
  };

  const handleStep = (
    field: 'aiQuizGenerations' | 'aiQuizMaxQuestions',
    delta: number,
    defaultVal: number,
    max?: number
  ) => {
    const currentStr = limitsForm[field];
    const baseVal = currentStr ? parseInt(currentStr, 10) : Math.min(defaultVal, max ?? defaultVal);
    let nextVal = Math.max(1, baseVal + delta);
    if (max !== undefined && nextVal > max) nextVal = max;
    onLimitsChange(field, String(nextVal));
  };

  const isGenCustom = Boolean(limitsForm.aiQuizGenerations?.trim());
  const isMaxQCustom = Boolean(limitsForm.aiQuizMaxQuestions?.trim());
  const genPresets = [10, 25, 50, 100].filter((n) => genMaxCap === undefined || n <= genMaxCap);
  const maxQPresets = [15, 20, 25, 30].filter((n) => n <= maxQCap);

  return (
    <div className="flex flex-col gap-3.5 rounded-xl bg-gradient-to-br from-[var(--primary-soft)]/20 via-[var(--card-solid)] to-[var(--card-solid)] border border-[var(--color-primary)]/25 p-4 shadow-xs">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {showGenCard && (
          <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-[var(--color-surface)]/70 border border-[var(--border)]">
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[var(--color-foreground)] flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                {t('adminUsers.aiQuizGenerations')}
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {genMaxCap !== undefined && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--info-light)] text-[var(--info)] border border-[var(--info)]/20">
                    {t('adminUsers.orgQuotaMaxBadge', { max: genMaxCap })}
                  </span>
                )}
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)]">
                  {isGenCustom
                    ? `${limitsForm.aiQuizGenerations} ${t('adminUsers.customOverride')}`
                    : `${t('adminUsers.globalDefaultBadge')}: ${globalGenerationsLimit}`}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[var(--color-muted-foreground)]">{t('adminUsers.totalAiRuns')}</p>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--color-surface)] shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleStep('aiQuizGenerations', -1, globalGenerationsLimit, genMaxCap)}
                  className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={genMaxCap}
                  value={limitsForm.aiQuizGenerations || ''}
                  onChange={(e) => onLimitsChange('aiQuizGenerations', clampValue(e.target.value, genMaxCap))}
                  placeholder={String(globalGenerationsLimit)}
                  className="w-16 text-center text-xs sm:text-sm font-semibold text-[var(--color-foreground)] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => handleStep('aiQuizGenerations', 1, globalGenerationsLimit, genMaxCap)}
                  disabled={genMaxCap !== undefined && Number(limitsForm.aiQuizGenerations || 0) >= genMaxCap}
                  className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 transition-colors active:scale-95"
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

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-[var(--color-muted-foreground)]">{t('adminUsers.preset')}:</span>
              <button
                type="button"
                onClick={() => onLimitsChange('aiQuizGenerations', '')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors border ${
                  !limitsForm.aiQuizGenerations
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-muted-strong)] text-[var(--color-foreground)] border-[var(--border)]'
                }`}
              >
                {t('adminUsers.globalDefaultBadge')} ({globalGenerationsLimit})
              </button>
              {genPresets.map((num) => (
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
        )}

        {showMaxQCard && (
          <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-[var(--color-surface)]/70 border border-[var(--border)]">
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[var(--color-foreground)] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
                {t('adminUsers.aiQuizMaxQuestions')}
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                {!isSuperAdmin && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--info-light)] text-[var(--info)] border border-[var(--info)]/20">
                    {t('adminUsers.orgQuotaMaxBadge', { max: maxQCap })}
                  </span>
                )}
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)]">
                  {isMaxQCustom
                    ? `${limitsForm.aiQuizMaxQuestions} ${t('adminUsers.customOverride')}`
                    : `${t('adminUsers.globalDefaultBadge')}: ${globalMaxQuestions}`}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-[var(--color-muted-foreground)]">{t('adminUsers.maxQuestionsPerRun')}</p>

            <div className="flex items-center gap-2">
              <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--color-surface)] shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleStep('aiQuizMaxQuestions', -1, globalMaxQuestions, maxQCap)}
                  className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxQCap}
                  value={limitsForm.aiQuizMaxQuestions || ''}
                  onChange={(e) => onLimitsChange('aiQuizMaxQuestions', clampValue(e.target.value, maxQCap))}
                  placeholder={String(globalMaxQuestions)}
                  className="w-16 text-center text-xs sm:text-sm font-semibold text-[var(--color-foreground)] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => handleStep('aiQuizMaxQuestions', 1, globalMaxQuestions, maxQCap)}
                  disabled={Number(limitsForm.aiQuizMaxQuestions || 0) >= maxQCap}
                  className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 transition-colors active:scale-95"
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

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-[var(--color-muted-foreground)]">{t('adminUsers.preset')}:</span>
              <button
                type="button"
                onClick={() => onLimitsChange('aiQuizMaxQuestions', '')}
                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors border ${
                  !limitsForm.aiQuizMaxQuestions
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-muted-strong)] text-[var(--color-foreground)] border-[var(--border)]'
                }`}
              >
                {t('adminUsers.globalDefaultBadge')} ({globalMaxQuestions})
              </button>
              {maxQPresets.map((num) => (
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
        )}
      </div>
    </div>
  );
}
