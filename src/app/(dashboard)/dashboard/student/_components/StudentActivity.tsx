'use client';

import { Activity, BookOpen, CheckCircle2, Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import ActivityCard from '@/components/ui/ActivityCard';
import type { ActivityItem, Enrollment, Attempt } from './types';

interface StudentActivityProps {
  enrollments: Enrollment[];
  attempts: Attempt[];
}

export default function StudentActivity({ enrollments, attempts }: StudentActivityProps) {
  const { t } = useTranslation();

  const activities: ActivityItem[] = [
    ...enrollments.map((e) => ({ ...e, type: 'enrollment' as const })),
    ...attempts
      .filter((a) => a.status === 'completed')
      .map((a) => ({ ...a, type: 'quiz' as const })),
  ];

  const getActivityDate = (item: ActivityItem): number => {
    if (item.type === 'quiz') {
      return new Date(item.submittedAt || item.startedAt).getTime();
    }
    return new Date(item.enrolledAt).getTime();
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return t('common.notAvailable');
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return t('common.notAvailable');

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday =
      new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

    if (isToday) {
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    }
    if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    }
    return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  };

  const recentActivity = activities
    .sort((a, b) => getActivityDate(b) - getActivityDate(a))
    .slice(0, 5);

  return (
    <section
      aria-labelledby="recent-activity-heading"
      className="student-panel overflow-hidden"
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[var(--border)]/70">
        <div className="min-w-0">
          <h2
            id="recent-activity-heading"
            className="text-base sm:text-lg font-bold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)]"
          >
            {t('dashboard.recentActivity')}
          </h2>
          <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
            {t('dashboard.recentActivityDesc')}
          </p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[var(--student-soft)] text-[var(--student-primary)] flex items-center justify-center shrink-0">
          <Activity className="w-5 h-5" />
        </div>
      </div>

      <div className="divide-y divide-[var(--border)]/60">
        {recentActivity.length === 0 ? (
          <div className="text-center py-10 px-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[var(--student-soft)] flex items-center justify-center text-[var(--student-primary)]">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-foreground)] mb-1">
              {t('dashboard.noRecentActivity')}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)]">
              {t('dashboard.startEnrolling')}
            </p>
          </div>
        ) : (
          recentActivity.map((item, index) => (
            <ActivityCard
              key={index}
              icon={item.type === 'enrollment' ? BookOpen : CheckCircle2}
              title={
                item.type === 'enrollment'
                  ? t('dashboard.enrolledIn').replace('{title}', item.course?.title || t('common.aCourse'))
                  : t('dashboard.completed').replace('{title}', item.quiz?.title || t('common.quiz'))
              }
              description={
                item.type === 'enrollment'
                  ? `${t('dashboard.progress')}: ${item.progress}%`
                  : `${t('dashboard.score')}: ${item.score}%`
              }
              date={
                item.type === 'enrollment'
                  ? formatDate(item.enrolledAt)
                  : formatDate(item.submittedAt || item.startedAt)
              }
              color={item.type === 'enrollment' ? 'student' : 'success'}
              delay={0.05 * index}
            />
          ))
        )}
      </div>
    </section>
  );
}
