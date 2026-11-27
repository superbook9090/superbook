'use client';

import React from 'react';
import {
  Activity,
  BookOpen,
  HelpCircle,
  FileText,
  Trophy,
  Users,
  Sparkles,
  ClipboardCheck,
  Award,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { User } from './types';

interface UserActivitySectionProps {
  user: User;
}

interface StatTile {
  key: string;
  label: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
}

export function UserActivitySection({ user }: UserActivitySectionProps) {
  const { t } = useTranslation();
  const stats = user.activityStats;

  if (!stats) {
    return null;
  }

  const isStudent = user.role === 'student';

  const tiles: StatTile[] = isStudent
    ? [
        {
          key: 'enrolledCourses',
          label: t('adminUsers.enrolledCourses'),
          value: stats.enrolledCoursesCount ?? 0,
          subtitle: t('adminUsers.completedCount', { count: stats.completedCoursesCount ?? 0 }),
          icon: <BookOpen className="w-4 h-4" />,
          iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        },
        {
          key: 'quizAttempts',
          label: t('adminUsers.quizAttempts'),
          value: stats.quizAttemptsCount ?? 0,
          subtitle: t('adminUsers.completedCount', {
            count: stats.completedQuizAttemptsCount ?? 0,
          }),
          icon: <ClipboardCheck className="w-4 h-4" />,
          iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
          key: 'contestsJoined',
          label: t('adminUsers.contestsJoined'),
          value: stats.contestAttemptsCount ?? 0,
          icon: <Trophy className="w-4 h-4" />,
          iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        {
          key: 'certificates',
          label: t('adminUsers.certificatesEarned'),
          value: stats.certificatesCount ?? 0,
          icon: <Award className="w-4 h-4" />,
          iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
        },
      ]
    : [
        {
          key: 'courses',
          label: t('adminUsers.coursesCreated'),
          value: stats.coursesCount ?? 0,
          subtitle: t('adminUsers.publishedCount', { count: stats.publishedCoursesCount ?? 0 }),
          icon: <BookOpen className="w-4 h-4" />,
          iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        },
        {
          key: 'quizzes',
          label: t('adminUsers.quizzesCreated'),
          value: stats.quizzesCount ?? 0,
          subtitle: t('adminUsers.publishedCount', { count: stats.publishedQuizzesCount ?? 0 }),
          icon: <HelpCircle className="w-4 h-4" />,
          iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
        },
        {
          key: 'blogs',
          label: t('adminUsers.blogsWritten'),
          value: stats.blogsCount ?? 0,
          icon: <FileText className="w-4 h-4" />,
          iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        },
        {
          key: 'contests',
          label: t('adminUsers.contestsCreated'),
          value: stats.contestsCount ?? 0,
          icon: <Trophy className="w-4 h-4" />,
          iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
        },
        {
          key: 'enrollments',
          label: t('adminUsers.courseEnrollments'),
          value: stats.courseEnrollmentsCount ?? 0,
          icon: <Users className="w-4 h-4" />,
          iconBg: 'bg-[var(--student-soft)] text-[var(--student-primary)]',
        },
        ...(user.role === 'teacher'
          ? [
              {
                key: 'aiRuns',
                label: t('adminUsers.aiQuizGenerations'),
                value: user.aiQuizGenerationsCount ?? 0,
                icon: <Sparkles className="w-4 h-4" />,
                iconBg: 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)]',
              },
            ]
          : []),
      ];

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--color-surface-muted)]/40 border border-[var(--border)]">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
          <Activity className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>{t('adminUsers.activitySummary')}</span>
        </div>
        <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
          {isStudent ? t('adminUsers.studentActivityDesc') : t('adminUsers.teacherActivityDesc')}
        </p>
      </div>

      <div className={`grid grid-cols-2 ${isStudent ? 'sm:grid-cols-4' : 'sm:grid-cols-3'} gap-2.5`}>
        {tiles.map((tile) => (
          <div
            key={tile.key}
            className="flex flex-col justify-between gap-2 p-3 rounded-xl bg-[var(--card-solid)] border border-[var(--border)]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-[var(--color-muted-foreground)] leading-tight">
                {tile.label}
              </span>
              <div className={`p-1.5 rounded-lg shrink-0 ${tile.iconBg}`}>{tile.icon}</div>
            </div>
            <div>
              <p className="text-lg sm:text-xl font-black tabular-nums text-[var(--color-foreground)] leading-none">
                {tile.value.toLocaleString()}
              </p>
              {tile.subtitle && (
                <p className="text-[11px] text-[var(--color-muted-foreground)] mt-1 truncate">
                  {tile.subtitle}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
