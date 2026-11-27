'use client';

import React from 'react';
import { ShieldCheck, Sliders, Video, Globe, Trophy, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { OrganizationItem } from './types';

interface OrganizationPolicySummaryProps {
  org: OrganizationItem;
}

export function OrganizationPolicySummary({ org }: OrganizationPolicySummaryProps) {
  const { t } = useTranslation();

  const grantedPermissions = [
    org.permissions?.canUploadVideos && {
      key: 'video',
      label: t('adminUsers.videoUploadPermission'),
      icon: <Video className="w-3 h-3" />,
      cls: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    },
    org.permissions?.canCreatePublicCourses && {
      key: 'publicCourse',
      label: t('adminUsers.canCreatePublicCourses'),
      icon: <Globe className="w-3 h-3" />,
      cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    },
    org.permissions?.canCreateContests && {
      key: 'contests',
      label: t('adminUsers.canCreateContests'),
      icon: <Trophy className="w-3 h-3" />,
      cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    },
    org.permissions?.canGenerateAiQuizzes && {
      key: 'aiQuiz',
      label: t('adminUsers.canGenerateAiQuizzes'),
      icon: <Sparkles className="w-3 h-3" />,
      cls: 'bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]/20',
    },
  ].filter(Boolean) as Array<{ key: string; label: string; icon: React.ReactNode; cls: string }>;

  const grantedLimits = [
    org.teacherLimits?.courses && `${t('adminUsers.courses')}: ${org.teacherLimits.courses}`,
    org.teacherLimits?.quizzes && `${t('adminUsers.quizzes')}: ${org.teacherLimits.quizzes}`,
    org.teacherLimits?.blogs && `${t('adminUsers.blogs')}: ${org.teacherLimits.blogs}`,
    org.teacherLimits?.aiQuizGenerations &&
      `${t('adminUsers.aiQuizGenerations')}: ${org.teacherLimits.aiQuizGenerations}`,
    org.teacherLimits?.aiQuizMaxQuestions &&
      `${t('adminUsers.aiQuizMaxQuestions')}: ${org.teacherLimits.aiQuizMaxQuestions}`,
  ].filter(Boolean) as string[];

  return (
    <div className="bg-[var(--color-surface-muted)]/40 border border-[var(--border)] rounded-xl p-3.5 space-y-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] tracking-wider">
        <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)]" />
        <span>{t('organizations.grantedPermissionsAndQuotas')}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {grantedPermissions.length > 0 ? (
          grantedPermissions.map((item) => (
            <span
              key={item.key}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${item.cls}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </span>
          ))
        ) : (
          <span className="text-xs text-[var(--color-muted-foreground)] italic">
            {t('organizations.noFeaturesGranted')}
          </span>
        )}
      </div>

      <div className="flex items-center flex-wrap gap-1.5 pt-2 border-t border-[var(--border)]/60">
        <Sliders className="w-3 h-3 text-[var(--teacher-primary)] shrink-0" />
        {grantedLimits.length > 0 ? (
          grantedLimits.map((entry) => (
            <span
              key={entry}
              className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] tabular-nums"
            >
              {entry}
            </span>
          ))
        ) : (
          <span className="text-xs text-[var(--color-muted-foreground)] italic">
            {t('organizations.noQuotaCeilingsGranted')}
          </span>
        )}
      </div>
    </div>
  );
}
