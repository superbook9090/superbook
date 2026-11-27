'use client';

import React from 'react';
import {
  BookOpen,
  HelpCircle,
  FileText,
  Trophy,
  Users,
  ClipboardCheck,
  Award,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from '@/components/ui/Tooltip';
import type { User } from './types';

interface UserActivityBadgesProps {
  user: User;
  align?: 'start' | 'end';
}

export function UserActivityBadges({ user, align = 'start' }: UserActivityBadgesProps) {
  const { t } = useTranslation();
  const stats = user.activityStats;

  if (!stats) {
    return (
      <span className="text-xs text-[var(--color-muted)] italic">
        {t('adminUsers.noActivityYet')}
      </span>
    );
  }

  const justifyClass = align === 'end' ? 'justify-end' : 'justify-start';

  if (user.role === 'student') {
    const enrolled = stats.enrolledCoursesCount ?? 0;
    const completedCourses = stats.completedCoursesCount ?? 0;
    const quizAttempts = stats.quizAttemptsCount ?? 0;
    const completedQuizzes = stats.completedQuizAttemptsCount ?? 0;
    const contests = stats.contestAttemptsCount ?? 0;
    const certs = stats.certificatesCount ?? 0;

    return (
      <div className={`flex flex-wrap items-center gap-1.5 ${justifyClass}`}>
        <Tooltip
          label={`${t('adminUsers.enrolledCourses')}: ${enrolled} (${t('adminUsers.completedCount', { count: completedCourses })})`}
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 tabular-nums">
            <BookOpen className="w-3 h-3 shrink-0" />
            <span>{enrolled}</span>
            <span className="font-medium opacity-85">{t('adminUsers.courses')}</span>
          </span>
        </Tooltip>

        <Tooltip
          label={`${t('adminUsers.quizAttempts')}: ${quizAttempts} (${t('adminUsers.completedCount', { count: completedQuizzes })})`}
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tabular-nums">
            <ClipboardCheck className="w-3 h-3 shrink-0" />
            <span>{quizAttempts}</span>
            <span className="font-medium opacity-85">{t('adminUsers.quizzes')}</span>
          </span>
        </Tooltip>

        {contests > 0 && (
          <Tooltip label={`${t('adminUsers.contestsJoined')}: ${contests}`}>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 tabular-nums">
              <Trophy className="w-3 h-3 shrink-0" />
              <span>{contests}</span>
            </span>
          </Tooltip>
        )}

        {certs > 0 && (
          <Tooltip label={`${t('adminUsers.certificatesEarned')}: ${certs}`}>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 tabular-nums">
              <Award className="w-3 h-3 shrink-0" />
              <span>{certs}</span>
            </span>
          </Tooltip>
        )}
      </div>
    );
  }

  const courses = stats.coursesCount ?? 0;
  const publishedCourses = stats.publishedCoursesCount ?? 0;
  const quizzes = stats.quizzesCount ?? 0;
  const publishedQuizzes = stats.publishedQuizzesCount ?? 0;
  const blogs = stats.blogsCount ?? 0;
  const contests = stats.contestsCount ?? 0;
  const enrollments = stats.courseEnrollmentsCount ?? 0;
  const isTeacher = user.role === 'teacher';

  if (!isTeacher && courses === 0 && quizzes === 0 && blogs === 0 && contests === 0) {
    return (
      <span className="text-xs text-[var(--color-muted)] italic">
        {t('adminUsers.noActivityYet')}
      </span>
    );
  }

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${justifyClass}`}>
      {(isTeacher || courses > 0) && (
        <Tooltip
          label={`${t('adminUsers.coursesCreated')}: ${courses} (${t('adminUsers.publishedCount', { count: publishedCourses })})`}
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 tabular-nums">
            <BookOpen className="w-3 h-3 shrink-0" />
            <span>{courses}</span>
            <span className="font-medium opacity-85">{t('adminUsers.courses')}</span>
          </span>
        </Tooltip>
      )}

      {(isTeacher || quizzes > 0) && (
        <Tooltip
          label={`${t('adminUsers.quizzesCreated')}: ${quizzes} (${t('adminUsers.publishedCount', { count: publishedQuizzes })})`}
        >
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tabular-nums">
            <HelpCircle className="w-3 h-3 shrink-0" />
            <span>{quizzes}</span>
            <span className="font-medium opacity-85">{t('adminUsers.quizzes')}</span>
          </span>
        </Tooltip>
      )}

      {(isTeacher || blogs > 0) && (
        <Tooltip label={`${t('adminUsers.blogsWritten')}: ${blogs}`}>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 tabular-nums">
            <FileText className="w-3 h-3 shrink-0" />
            <span>{blogs}</span>
            <span className="font-medium opacity-85">{t('adminUsers.blogs')}</span>
          </span>
        </Tooltip>
      )}

      {contests > 0 && (
        <Tooltip label={`${t('adminUsers.contestsCreated')}: ${contests}`}>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 tabular-nums">
            <Trophy className="w-3 h-3 shrink-0" />
            <span>{contests}</span>
          </span>
        </Tooltip>
      )}

      {enrollments > 0 && (
        <Tooltip label={`${t('adminUsers.courseEnrollments')}: ${enrollments}`}>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-border)] tabular-nums">
            <Users className="w-3 h-3 shrink-0" />
            <span>{enrollments}</span>
          </span>
        </Tooltip>
      )}
    </div>
  );
}
