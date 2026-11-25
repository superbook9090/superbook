'use client';

import { Filter, Users, Activity, BookOpen, Award, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { LearnerFunnelData } from './types';

interface AdminFunnelChartProps {
  funnel?: LearnerFunnelData;
}

export function AdminFunnelChart({ funnel }: AdminFunnelChartProps) {
  const { t } = useTranslation();

  const base = Math.max(funnel?.registered ?? 0, 1);

  const stages = [
    {
      label: t('adminAnalytics.funnelRegistered'),
      value: funnel?.registered ?? 0,
      icon: Users,
      barStyle: { background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)' },
      badgeTone: 'bg-sky-500/12 text-sky-700 dark:text-sky-400',
    },
    {
      label: t('adminAnalytics.funnelActive30d'),
      value: funnel?.active30d ?? 0,
      icon: Activity,
      barStyle: { background: 'linear-gradient(90deg, #6366f1, #818cf8)' },
      badgeTone: 'bg-indigo-500/12 text-indigo-700 dark:text-indigo-400',
    },
    {
      label: t('adminAnalytics.funnelEnrolled'),
      value: funnel?.enrolledLearners ?? 0,
      icon: BookOpen,
      barStyle: { background: 'var(--teacher-gradient)' },
      badgeTone: 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)]',
    },
    {
      label: t('adminAnalytics.funnelQuizTakers'),
      value: funnel?.quizParticipants ?? 0,
      icon: Award,
      barStyle: { background: 'linear-gradient(90deg, #f59e0b, #fbbf24)' },
      badgeTone: 'bg-amber-500/12 text-amber-700 dark:text-amber-400',
    },
    {
      label: t('adminAnalytics.funnelCompleted'),
      value: funnel?.completedEnrollments ?? 0,
      icon: CheckCircle2,
      barStyle: { background: 'linear-gradient(90deg, #10b981, #34d399)' },
      badgeTone: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400',
    },
  ];

  return (
    <div className="teacher-panel p-4 sm:p-5 h-full flex flex-col justify-between gap-4 overflow-hidden">
      <div className="flex items-start gap-2.5 pb-3.5 border-b border-[var(--border)]/70">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-sky-500/12 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0">
          <Filter className="w-4 h-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
            {t('adminAnalytics.funnelTitle')}
          </h3>
          <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-1">
            {t('adminAnalytics.funnelSubtitle')}
          </p>
        </div>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {stages.map((stage, idx) => {
          const pctOfBase = funnel?.registered ? Math.min(100, Math.round((stage.value / base) * 100)) : 0;
          const barWidth = stage.value > 0 ? Math.max(6, pctOfBase) : 0;
          const Icon = stage.icon;

          return (
            <div key={stage.label} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-2 font-semibold text-[var(--color-foreground)] min-w-0">
                  <span className="text-[10px] font-bold text-[var(--color-muted-foreground)] w-4 tabular-nums">
                    {idx + 1}.
                  </span>
                  <Icon className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] shrink-0" />
                  <span className="truncate">{stage.label}</span>
                </span>

                <div className="flex items-center gap-2 shrink-0 tabular-nums">
                  <span className="font-extrabold text-[var(--color-foreground)]">
                    {stage.value.toLocaleString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stage.badgeTone}`}>
                    {pctOfBase}%
                  </span>
                </div>
              </div>

              <div className="w-full h-2.5 rounded-full bg-[var(--surface-muted-strong)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${barWidth}%`, ...stage.barStyle }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
