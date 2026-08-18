'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, GraduationCap, Award, Filter } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime } from '@/lib/dateUtils';
import type { ActivityItem } from './types';

interface AdminActivityTabProps {
  activity: ActivityItem[];
}

type ActivityFilter = 'all' | 'enrollment' | 'quiz_attempt';

export function AdminActivityTab({ activity }: AdminActivityTabProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<ActivityFilter>('all');

  const filteredActivity = useMemo(() => {
    if (!activity) return [];
    if (filter === 'all') return activity;
    return activity.filter((item) => item.type === filter);
  }, [activity, filter]);

  const filterTabs: { id: ActivityFilter; label: string }[] = [
    { id: 'all', label: t('adminAnalytics.filterAll') },
    { id: 'enrollment', label: t('adminAnalytics.filterEnrollments') },
    { id: 'quiz_attempt', label: t('adminAnalytics.filterQuizzes') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4 sm:space-y-6 w-full min-w-0"
    >
      <div className="card-panel w-full min-w-0 overflow-hidden">
        <div className="card-panel-header flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-[var(--color-foreground)] flex items-center gap-2 truncate">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)] shrink-0" />
              <span>{t('adminAnalytics.activityFeed')}</span>
            </h3>
            <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
              {t('adminAnalytics.activityFeedSubtitle')}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-[var(--color-surface-muted)] rounded-lg border border-[var(--color-border)] self-start sm:self-auto overflow-x-auto max-w-full shrink-0 scrollbar-none">
            <Filter className="w-3.5 h-3.5 text-[var(--color-muted)] ml-1 mr-0.5 shrink-0" />
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap shrink-0 touch-target ${
                  filter === tab.id
                    ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-xs'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredActivity.length === 0 ? (
          <div className="card-panel-body text-center py-10 sm:py-12">
            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-[var(--color-muted)] mx-auto mb-2 opacity-50" />
            <p className="text-[var(--color-muted-foreground)] text-xs sm:text-sm">{t('adminAnalytics.noActivityFound')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {filteredActivity.map((event, idx) => {
              const isEnrollment = event.type === 'enrollment';
              const Icon = isEnrollment ? GraduationCap : Award;
              const badgeClass = isEnrollment
                ? 'bg-[var(--info-light)] text-[var(--info)]'
                : 'bg-[var(--warning-light)] text-[var(--warning)]';

              return (
                <li
                  key={idx}
                  className="p-3 sm:p-4 sm:px-6 hover:bg-[var(--color-surface-muted)] transition-colors flex items-start justify-between gap-3 sm:gap-4 min-w-0"
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className={`p-1.5 sm:p-2 rounded-xl shrink-0 ${badgeClass}`}>
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] break-words">
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
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] sm:text-[11px] font-medium text-[var(--color-muted)]">
                          {formatDateTime(event.date)}
                        </span>
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)]">
                          {isEnrollment
                            ? t('adminAnalytics.eventEnrollment')
                            : t('adminAnalytics.eventQuiz')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isEnrollment && event.score !== undefined && (
                    <span
                      className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold tabular-nums shrink-0 ${
                        event.score >= 70
                          ? 'bg-[var(--success-light)] text-[var(--success)]'
                          : event.score >= 50
                            ? 'bg-[var(--warning-light)] text-[var(--warning)]'
                            : 'bg-[var(--error-light)] text-[var(--error)]'
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
    </motion.div>
  );
}
