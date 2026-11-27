'use client';

import React from 'react';
import { BookOpen, HelpCircle, FileText, RotateCcw, Plus, Minus, Layers } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface TeacherQuotasTabProps {
  limitsForm: {
    courses: string;
    quizzes: string;
    blogs: string;
  };
  usedCounts?: {
    courses?: number;
    quizzes?: number;
    blogs?: number;
  };
  orgMaxLimits?: {
    courses?: number;
    quizzes?: number;
    blogs?: number;
  };
  isSuperAdmin?: boolean;
  globalCoursesLimit: number;
  globalQuizzesLimit: number;
  globalBlogsLimit: number;
  onLimitsChange: (field: 'courses' | 'quizzes' | 'blogs', value: string) => void;
}

export function TeacherQuotasTab({
  limitsForm,
  usedCounts,
  orgMaxLimits,
  isSuperAdmin = true,
  globalCoursesLimit,
  globalQuizzesLimit,
  globalBlogsLimit,
  onLimitsChange,
}: TeacherQuotasTabProps) {
  const { t } = useTranslation();

  const allQuotas: Array<{
    field: 'courses' | 'quizzes' | 'blogs';
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    globalVal: number;
    orgMax?: number;
  }> = [
    {
      field: 'courses',
      icon: <BookOpen className="w-4 h-4" />,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
      title: t('adminUsers.courses'),
      globalVal: globalCoursesLimit,
      orgMax: orgMaxLimits?.courses,
    },
    {
      field: 'quizzes',
      icon: <HelpCircle className="w-4 h-4" />,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      title: t('adminUsers.quizzes'),
      globalVal: globalQuizzesLimit,
      orgMax: orgMaxLimits?.quizzes,
    },
    {
      field: 'blogs',
      icon: <FileText className="w-4 h-4" />,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      title: t('adminUsers.blogs'),
      globalVal: globalBlogsLimit,
      orgMax: orgMaxLimits?.blogs,
    },
  ];

  const quotas = isSuperAdmin
    ? allQuotas
    : allQuotas.filter((q) => typeof q.orgMax === 'number' && q.orgMax >= 1);

  const clampValue = (raw: string, max?: number) => {
    if (!raw.trim()) return '';
    const parsed = parseInt(raw, 10);
    if (!Number.isFinite(parsed) || parsed < 1) return '1';
    if (max !== undefined && parsed > max) return String(max);
    return String(parsed);
  };

  const handleStep = (
    field: 'courses' | 'quizzes' | 'blogs',
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

  return (
    <div className="flex flex-col rounded-xl bg-[var(--card-solid)] border border-[var(--border)] overflow-hidden shadow-xs">
      {/* Sub-header info bar */}
      <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-[var(--color-surface-muted)]/50 border-b border-[var(--border)] text-xs text-[var(--color-muted-foreground)]">
        <span className="flex items-center gap-1.5 font-medium">
          <Layers className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
          <span>{t('adminUsers.contentQuotasTitle')}</span>
        </span>
        <span>{t('adminUsers.leaveEmptyForGlobal')}</span>
      </div>

      {/* Quota Rows */}
      <div className="divide-y divide-[var(--border)]/60">
        {quotas.map((item) => {
          const val = limitsForm[item.field];
          const isCustom = Boolean(val && val.trim() !== '');
          const maxCap = isSuperAdmin ? undefined : item.orgMax;

          return (
            <div
              key={item.field}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-4 hover:bg-[var(--color-surface-muted)]/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2 rounded-lg ${item.iconBg} shrink-0`}>
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)]">
                      {item.title}
                    </p>
                    {isCustom ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        {t('adminUsers.customOverride')}
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)]">
                        {t('adminUsers.globalDefaultBadge')}: {item.globalVal}
                      </span>
                    )}
                    {maxCap !== undefined && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--info-light)] text-[var(--info)] border border-[var(--info)]/20">
                        {t('adminUsers.orgQuotaMaxBadge', { max: maxCap })}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--color-muted-foreground)]">
                    {usedCounts?.[item.field] !== undefined && (
                      <span className="font-semibold text-[var(--color-foreground)] mr-1.5">
                        {t('adminUsers.createdCount', { count: usedCounts[item.field] ?? 0 })}
                      </span>
                    )}
                    <span>
                      ({t('adminUsers.ofLimit', { limit: isCustom ? val : item.globalVal })})
                    </span>
                  </p>
                </div>
              </div>

              {/* Stepper + Reset Control */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                <div className="inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--color-surface)] shadow-xs overflow-hidden">
                  <button
                    type="button"
                    onClick={() => handleStep(item.field, -1, item.globalVal, maxCap)}
                    aria-label={t('adminUsers.stepperDecrease')}
                    className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="number"
                    min="1"
                    max={maxCap}
                    value={val}
                    onChange={(e) => onLimitsChange(item.field, clampValue(e.target.value, maxCap))}
                    placeholder={String(item.globalVal)}
                    className="w-16 text-center text-xs sm:text-sm font-semibold text-[var(--color-foreground)] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  <button
                    type="button"
                    onClick={() => handleStep(item.field, 1, item.globalVal, maxCap)}
                    disabled={maxCap !== undefined && Number(val || 0) >= maxCap}
                    aria-label={t('adminUsers.stepperIncrease')}
                    className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] disabled:opacity-40 transition-colors active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isCustom && (
                  <button
                    type="button"
                    onClick={() => onLimitsChange(item.field, '')}
                    title={t('adminUsers.resetToGlobal')}
                    className="p-2 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] border border-transparent hover:border-[var(--border)] transition-colors text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
