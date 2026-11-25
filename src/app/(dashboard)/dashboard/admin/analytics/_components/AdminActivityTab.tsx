'use client';

import { useState, useMemo } from 'react';
import { Activity, GraduationCap, Award } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime } from '@/lib/dateUtils';
import { EmptyState } from '@/components/layout';
import type { ActivityItem } from './types';

interface AdminActivityTabProps {
  activity: ActivityItem[];
}

type ActivityFilter = 'all' | 'enrollment' | 'quiz_attempt';

export function AdminActivityTab({ activity }: AdminActivityTabProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const counts = useMemo(() => {
    const list = activity || [];
    return {
      all: list.length,
      enrollment: list.filter((i) => i.type === 'enrollment').length,
      quiz_attempt: list.filter((i) => i.type === 'quiz_attempt').length,
    };
  }, [activity]);

  const filteredActivity = useMemo(() => {
    if (!activity) return [];
    if (filter === 'all') return activity;
    return activity.filter((item) => item.type === filter);
  }, [activity, filter]);

  const filterTabs: { id: ActivityFilter; label: string; count: number }[] = [
    { id: 'all', label: t('adminAnalytics.filterAll'), count: counts.all },
    { id: 'enrollment', label: t('adminAnalytics.filterEnrollments'), count: counts.enrollment },
    { id: 'quiz_attempt', label: t('adminAnalytics.filterQuizzes'), count: counts.quiz_attempt },
  ];

  return (
    <div className="teacher-panel w-full min-w-0 overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-[var(--border)]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] shrink-0">
            <Activity className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] truncate">
              {t('adminAnalytics.activityFeed')}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 line-clamp-1">
              {t('adminAnalytics.activityFeedSubtitle')}
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] self-start sm:self-auto overflow-x-auto max-w-full shrink-0 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`inline-flex items-center gap-1.5 px-2.5 min-h-[34px] text-xs font-bold rounded-[8px] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums leading-none ${
                    isActive
                      ? 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)]'
                      : 'bg-[var(--card-solid)]/80 text-[var(--color-muted-foreground)]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredActivity.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={Activity}
            title={t('adminAnalytics.noActivityFound')}
            description={t('adminAnalytics.activityFeedSubtitle')}
          />
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border)]/70">
          {filteredActivity.map((event, idx) => {
            const isEnrollment = event.type === 'enrollment';
            const Icon = isEnrollment ? GraduationCap : Award;
            const iconTone = isEnrollment
              ? 'bg-sky-500/12 text-sky-600 dark:text-sky-400 border-sky-500/20'
              : 'bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/20';

            return (
              <li
                key={idx}
                className="p-4 sm:px-5 hover:bg-[var(--surface-muted)]/45 transition-colors flex items-start justify-between gap-3 sm:gap-4 min-w-0"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <span
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] border shrink-0 ${iconTone}`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] break-words leading-snug">
                      {isEnrollment
                        ? t('adminAnalytics.enrolledInCourse', {
                            user: event.user,
                            course: event.item,
                          })
                        : t('adminAnalytics.completedQuizWithScore', {
                            user: event.user,
                            quiz: event.item,
                            score: event.score ?? 0,
                          })}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-[11px] font-medium text-[var(--color-muted-foreground)]">
                        {formatDateTime(event.date)}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                          isEnrollment
                            ? 'bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/20'
                            : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {isEnrollment
                          ? t('adminAnalytics.eventEnrollment')
                          : t('adminAnalytics.eventQuiz')}
                      </span>
                    </div>
                  </div>
                </div>

                {!isEnrollment && event.score !== undefined && (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold tabular-nums shrink-0 border ${
                      event.score >= 70
                        ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-500/25'
                        : event.score >= 50
                        ? 'bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-500/25'
                        : 'bg-rose-500/12 text-rose-700 dark:text-rose-400 border-rose-500/25'
                    }`}
                  >
                    {event.score}%
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
