'use client';

import React from 'react';
import { Video, Globe, Trophy, Sparkles, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { User } from './types';

interface TeacherPermissionsTabProps {
  user: User;
  onToggleVideo: (currentVal: boolean) => void;
  onTogglePublicCourse: (currentVal: boolean) => void;
  onToggleContest?: (currentVal: boolean) => void;
  onToggleAiQuizGen?: (currentVal: boolean) => void;
}

export function TeacherPermissionsTab({
  user,
  onToggleVideo,
  onTogglePublicCourse,
  onToggleContest,
  onToggleAiQuizGen,
}: TeacherPermissionsTabProps) {
  const { t } = useTranslation();

  const permissions = [
    {
      id: 'video',
      icon: <Video className="w-4 h-4" />,
      iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      title: t('adminUsers.videoUploadPermission') || 'Video Uploads',
      desc: t('adminUsers.videoUploadPermissionDesc') || 'Allow unlisted YouTube video lectures.',
      checked: Boolean(user.canUploadVideos),
      onToggle: () => onToggleVideo(Boolean(user.canUploadVideos)),
      activeClass: 'peer-checked:bg-[var(--teacher-primary)]',
    },
    {
      id: 'publicCourse',
      icon: <Globe className="w-4 h-4" />,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      title: t('adminUsers.canCreatePublicCourses') || 'Public Courses',
      desc: t('adminUsers.canCreatePublicCoursesDesc') || 'Create open courses without join codes.',
      checked: Boolean(user.canCreatePublicCourses),
      onToggle: () => onTogglePublicCourse(Boolean(user.canCreatePublicCourses)),
      activeClass: 'peer-checked:bg-[var(--teacher-primary)]',
    },
    {
      id: 'contests',
      icon: <Trophy className="w-4 h-4" />,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      title: t('adminUsers.canCreateContests') || 'Contest Creator',
      desc: t('adminUsers.canCreateContestsDesc') || 'Create & schedule live competitive contests.',
      checked: Boolean(user.canCreateContests),
      onToggle: () => onToggleContest?.(Boolean(user.canCreateContests)),
      activeClass: 'peer-checked:bg-[var(--warning)]',
    },
    {
      id: 'aiQuiz',
      icon: <Sparkles className="w-4 h-4" />,
      iconBg: 'bg-[var(--primary-soft)] text-[var(--color-primary)]',
      title: t('adminUsers.canGenerateAiQuizzes') || 'AI Quiz Generation',
      desc: t('adminUsers.canGenerateAiQuizzesDesc') || 'Allow teacher to generate quiz questions using AI.',
      checked: Boolean(user.canGenerateAiQuizzes),
      onToggle: () => onToggleAiQuizGen?.(Boolean(user.canGenerateAiQuizzes)),
      activeClass: 'peer-checked:bg-[var(--color-primary)]',
    },
  ];

  const enabledCount = permissions.filter((p) => p.checked).length;

  return (
    <div className="flex flex-col rounded-xl bg-[var(--card-solid)] border border-[var(--border)] overflow-hidden shadow-xs">
      {/* Sub-header info bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--color-surface-muted)]/50 border-b border-[var(--border)] text-xs text-[var(--color-muted-foreground)]">
        <span className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
          <span>{t('adminUsers.featurePermissions') || 'Feature Permissions'}</span>
        </span>
        <span className="font-semibold text-[var(--color-foreground)]">
          {enabledCount} of {permissions.length} active
        </span>
      </div>

      {/* Permission Rows */}
      <div className="divide-y divide-[var(--border)]/60">
        {permissions.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-3 p-3.5 sm:px-4 hover:bg-[var(--color-surface-muted)]/30 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2 rounded-lg ${item.iconBg} shrink-0`}>
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] truncate">
                  {item.title}
                </p>
                <p className="text-[11px] text-[var(--color-muted-foreground)] truncate">
                  {item.desc}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={item.onToggle}
                className="sr-only peer"
              />
              <div
                className={`w-11 h-6 bg-[var(--color-surface-muted-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--color-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${item.activeClass}`}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
