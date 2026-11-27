'use client';

import React from 'react';
import { Video, Globe, Sparkles, Sliders, Trophy } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from '@/components/ui/Tooltip';
import type { User } from './types';

interface UserCapabilitiesCellProps {
  user: User;
}

export function UserCapabilitiesCell({ user }: UserCapabilitiesCellProps) {
  const { t } = useTranslation();

  if (user.role !== 'teacher') {
    return (
      <span className="text-xs text-[var(--color-muted)] italic">
        {user.role === 'student' ? t('adminUsers.studentDefaults') : t('adminUsers.staffLevel')}
      </span>
    );
  }

  const hasCustomLimits = Boolean(
    (user.limits?.courses !== undefined && user.limits?.courses !== null) ||
      (user.limits?.quizzes !== undefined && user.limits?.quizzes !== null) ||
      (user.limits?.blogs !== undefined && user.limits?.blogs !== null) ||
      (user.limits?.aiQuizGenerations !== undefined && user.limits?.aiQuizGenerations !== null) ||
      (user.limits?.aiQuizMaxQuestions !== undefined && user.limits?.aiQuizMaxQuestions !== null)
  );

  const customParts: string[] = [];
  if (user.limits?.courses !== undefined && user.limits?.courses !== null) {
    customParts.push(`${t('adminUsers.courses')}: ${user.limits.courses}`);
  }
  if (user.limits?.quizzes !== undefined && user.limits?.quizzes !== null) {
    customParts.push(`${t('adminUsers.quizzes')}: ${user.limits.quizzes}`);
  }
  if (user.limits?.blogs !== undefined && user.limits?.blogs !== null) {
    customParts.push(`${t('adminUsers.blogs')}: ${user.limits.blogs}`);
  }
  if (user.limits?.aiQuizGenerations !== undefined && user.limits?.aiQuizGenerations !== null) {
    customParts.push(`AI Runs: ${user.limits.aiQuizGenerations}`);
  }
  if (user.limits?.aiQuizMaxQuestions !== undefined && user.limits?.aiQuizMaxQuestions !== null) {
    customParts.push(`Max Qs: ${user.limits.aiQuizMaxQuestions}`);
  }
  const customLimitsSummary = customParts.join(' • ');

  return (
    <div className="flex flex-col gap-1.5 text-xs">
      <div>
        {hasCustomLimits ? (
          <Tooltip label={customLimitsSummary}>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 cursor-default">
              <Sliders className="w-3 h-3" />
              <span>{t('adminUsers.customLimits')}</span>
            </span>
          </Tooltip>
        ) : (
          <Tooltip label={t('adminUsers.platformDefaultsTooltip')}>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)] cursor-default">
              <span>{t('adminUsers.standardLimits')}</span>
            </span>
          </Tooltip>
        )}
      </div>
      <div className="flex items-center gap-1.5">
        {user.canUploadVideos && (
          <Tooltip label={t('adminUsers.videoUploadPermission')}>
            <span className="p-1 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400">
              <Video className="w-3 h-3" />
            </span>
          </Tooltip>
        )}
        {user.canCreatePublicCourses && (
          <Tooltip label={t('adminUsers.canCreatePublicCourses')}>
            <span className="p-1 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <Globe className="w-3 h-3" />
            </span>
          </Tooltip>
        )}
        {user.canCreateContests && (
          <Tooltip label={t('adminUsers.canCreateContests')}>
            <span className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Trophy className="w-3 h-3" />
            </span>
          </Tooltip>
        )}
        {user.canGenerateAiQuizzes && (
          <Tooltip label={t('adminUsers.canGenerateAiQuizzes')}>
            <span className="p-1 rounded bg-[var(--primary-soft)] text-[var(--color-primary)]">
              <Sparkles className="w-3 h-3" />
            </span>
          </Tooltip>
        )}
      </div>
    </div>
  );
}
