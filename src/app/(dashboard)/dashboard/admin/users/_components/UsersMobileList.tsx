'use client';

import React from 'react';
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  ChevronRight,
  UserX,
  Shield,
  Smartphone,
  Globe,
  Clock,
  Sliders,
  Trophy,
  Video,
  Sparkles,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate, getRelativeTime } from '@/lib/dateUtils';
import type { User } from './types';
import { UserActivityBadges } from './UserActivityBadges';

type Props = {
  users: User[];
  organizations: Array<{ _id: string; name: string }>;
  handleOpenUserDetail: (user: User) => void;
};

const roleBadgeConfig: Record<string, { bg: string; text: string }> = {
  superadmin: {
    bg: 'bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
  },
  admin: {
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
  teacher: {
    bg: 'bg-[var(--teacher-soft)]',
    text: 'text-[var(--teacher-primary)]',
  },
  student: {
    bg: 'bg-[var(--student-soft)]',
    text: 'text-[var(--student-primary)]',
  },
};

export function UsersMobileList({ users, organizations, handleOpenUserDetail }: Props) {
  const { t } = useTranslation();

  const getInitials = (name?: string) =>
    name
      ? name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'U';

  return (
    <div className="sm:hidden flex flex-col gap-3">
      {users.map((user) => {
        const roleBadge = roleBadgeConfig[user.role] || roleBadgeConfig.student;
        const orgName = organizations.find((org) => org._id === user.organizationId)?.name;

        const hasCustomLimits =
          user.role === 'teacher' &&
          Boolean(
            (user.limits?.courses !== undefined && user.limits?.courses !== null) ||
              (user.limits?.quizzes !== undefined && user.limits?.quizzes !== null) ||
              (user.limits?.blogs !== undefined && user.limits?.blogs !== null) ||
              (user.limits?.aiQuizGenerations !== undefined && user.limits?.aiQuizGenerations !== null) ||
              (user.limits?.aiQuizMaxQuestions !== undefined && user.limits?.aiQuizMaxQuestions !== null)
          );

        return (
          <div
            key={user._id}
            onClick={() => handleOpenUserDetail(user)}
            className="teacher-card p-4 active:scale-[0.99] cursor-pointer flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-[10px] text-white flex items-center justify-center font-bold text-sm shrink-0"
                  style={{ background: 'var(--teacher-gradient)' }}
                >
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-[var(--color-foreground)] truncate">{user.name}</p>
                    {user.isSuspended && (
                      <span className="p-0.5 rounded bg-[var(--error-light)] text-[var(--error)]" title="Suspended">
                        <UserX className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-muted-foreground)] flex items-center gap-1 truncate mt-0.5">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                  {user.phone && (
                    <p className="text-[11px] text-[var(--color-muted-foreground)] flex items-center gap-1 truncate mt-0.5">
                      <Phone className="w-3 h-3 shrink-0 text-[var(--success)]" />
                      <span className="truncate">{user.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-[8px] capitalize shrink-0 ${roleBadge.bg} ${roleBadge.text}`}
              >
                <Shield className="w-3 h-3" />
                {user.role}
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-2.5 border-t border-[var(--border)]/70 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="text-[var(--color-muted-foreground)] shrink-0 pt-0.5">
                  {t('adminUsers.activity')}
                </span>
                <UserActivityBadges user={user} align="end" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted-foreground)]">{t('adminAnalytics.platform')}</span>
                {user.lastPlatform === 'android' || user.lastPlatform === 'ios' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--teacher-soft)] text-[var(--teacher-primary)] text-[11px] font-semibold">
                    <Smartphone className="w-3 h-3" />
                    {user.lastPlatform === 'android' ? 'Android App' : 'iOS App'}
                  </span>
                ) : user.lastPlatform === 'web' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--info-light)] text-[var(--info)] text-[11px] font-semibold">
                    <Globe className="w-3 h-3" />
                    Website
                  </span>
                ) : (
                  <span className="text-[var(--color-muted-foreground)] italic">N/A</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted-foreground)]">{t('adminUsers.lastOpened')}</span>
                {user.lastActiveAt ? (
                  <span className="font-semibold text-[var(--color-foreground)] inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[var(--teacher-primary)]" />
                    {getRelativeTime(user.lastActiveAt)}
                  </span>
                ) : (
                  <span className="text-[var(--color-muted-foreground)] italic">{t('common.never')}</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted-foreground)]">{t('adminUsers.organization')}</span>
                {orgName ? (
                  <span className="font-semibold text-[var(--color-foreground)] inline-flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[var(--info)]" />
                    {orgName}
                  </span>
                ) : (
                  <span className="text-[var(--color-muted-foreground)] italic">{t('common.none')}</span>
                )}
              </div>

              {user.role === 'teacher' && (
                <div className="flex flex-col gap-1.5 py-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-muted-foreground)]">
                      {t('adminUsers.capabilitiesAndLimits')}
                    </span>
                    {hasCustomLimits ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/12 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        <Sliders className="w-3 h-3" />
                        <span>{t('adminUsers.customLimits')}</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-[var(--surface-muted)] text-[var(--color-muted-foreground)]">
                        {t('adminUsers.standardLimits')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    {user.canUploadVideos && (
                      <span className="p-1 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400" title="Video Uploads">
                        <Video className="w-3 h-3" />
                      </span>
                    )}
                    {user.canCreatePublicCourses && (
                      <span className="p-1 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400" title="Public Courses">
                        <Globe className="w-3 h-3" />
                      </span>
                    )}
                    {user.canCreateContests && (
                      <span className="p-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400" title="Contest Creator">
                        <Trophy className="w-3 h-3" />
                      </span>
                    )}
                    {user.canGenerateAiQuizzes && (
                      <span className="p-1 rounded bg-[var(--teacher-soft)] text-[var(--teacher-primary)]" title="AI Quiz Generator">
                        <Sparkles className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted-foreground)]">{t('admin.joined')}</span>
                <span className="text-[var(--color-muted-foreground)] inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(user.createdAt)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border)]/70 flex items-center justify-between text-xs font-bold text-[var(--teacher-primary)] min-h-[40px]">
              <span>{t('adminUsers.manageUser')}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
