'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Activity, BookOpen, CheckCircle2, Clock } from 'lucide-react';
import ActivityCard from '@/components/ui/ActivityCard';
import type { ActivityItem, Enrollment, Attempt } from './types';

interface StudentActivityProps {
  enrollments: Enrollment[];
  attempts: Attempt[];
}

export default function StudentActivity({ enrollments, attempts }: StudentActivityProps) {
  const { t } = useTranslation();

  // Combine and sort recent activity
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
    } else if (isYesterday) {
      return `Yesterday, ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    }
    return (
      date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
      ', ' +
      date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    );
  };

  const recentActivity = activities
    .sort((a, b) => getActivityDate(b) - getActivityDate(a))
    .slice(0, 5);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      aria-labelledby="recent-activity-heading"
      className="card-surface rounded-2xl border border-[var(--border)] overflow-hidden"
    >
      <div className="card-panel-header flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)]">
        <div>
          <h2 id="recent-activity-heading" className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
            {t('dashboard.recentActivity')}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-0.5">
            {t('dashboard.recentActivityDesc')}
          </p>
        </div>
        <div className="p-2 rounded-xl bg-[var(--student-soft)] text-[var(--student-primary)]">
          <Activity className="w-5 h-5" />
        </div>
      </div>

      <div className="divide-y divide-[var(--border)]">
        {recentActivity.length === 0 ? (
          <div className="card-panel-body text-center py-10 px-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 rounded-2xl bg-[var(--color-surface-muted)] flex items-center justify-center text-[var(--color-muted)]">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-sm sm:text-base font-semibold text-[var(--color-foreground)] mb-1">
              {t('dashboard.noRecentActivity')}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
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
              delay={0.45 + index * 0.04}
            />
          ))
        )}
      </div>
    </motion.section>
  );
}
