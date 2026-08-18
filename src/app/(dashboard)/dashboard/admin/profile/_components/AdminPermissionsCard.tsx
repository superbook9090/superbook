'use client';

import React from 'react';
import type { Session } from '@/types';
import {
  Users,
  Building2,
  Sliders,
  Bell,
  BookOpen,
  FolderGit2,
  Video,
  BarChart3,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { isSuperAdmin } from '@/lib/roles';
import { useTranslation } from '@/hooks/useTranslation';

interface AdminPermissionsCardProps {
  session: Session;
}

export function AdminPermissionsCard({ session }: AdminPermissionsCardProps) {
  const { t } = useTranslation();
  const superAdmin = isSuperAdmin(session.user?.role);

  const permissions = [
    {
      title: t('adminProfile.permUserManagement') || 'User & Account Management',
      desc: t('adminProfile.permUserManagementDesc') || 'Create, update, suspend users, and assign access roles.',
      icon: Users,
      allowed: true,
      scope: superAdmin ? 'Global Platform' : 'Organization Scope',
    },
    {
      title: t('adminProfile.permOrgManagement') || 'Organization Governance',
      desc: t('adminProfile.permOrgManagementDesc') || 'Configure organizational settings, invite codes, and memberships.',
      icon: Building2,
      allowed: true,
      scope: superAdmin ? 'All Organizations' : 'Assigned Organization',
    },
    {
      title: t('adminProfile.permSystemConfig') || 'Platform Config & Feature Flags',
      desc: t('adminProfile.permSystemConfigDesc') || 'Toggle feature switches, maintenance mode, and global configs.',
      icon: Sliders,
      allowed: superAdmin,
      scope: superAdmin ? 'Superadmin Only' : 'Restricted',
    },
    {
      title: t('adminProfile.permBroadcast') || 'Push & System Broadcasts',
      desc: t('adminProfile.permBroadcastDesc') || 'Dispatch system-wide notifications and announcement broadcasts.',
      icon: Bell,
      allowed: superAdmin,
      scope: superAdmin ? 'Superadmin Only' : 'Restricted',
    },
    {
      title: t('adminProfile.permContentModeration') || 'Course & Content Oversight',
      desc: t('adminProfile.permContentModerationDesc') || 'Inspect and govern courses, quizzes, notes, video lectures, and blogs.',
      icon: BookOpen,
      allowed: true,
      scope: superAdmin ? 'All Platform Courses' : 'Org Courses',
    },
    {
      title: t('adminProfile.permFileHub') || 'File Asset Repository',
      desc: t('adminProfile.permFileHubDesc') || 'Centrally inspect, download, and manage storage assets across the platform.',
      icon: FolderGit2,
      allowed: true,
      scope: 'Platform Files',
    },
    {
      title: t('adminProfile.manageVideos') || 'Video Lectures',
      desc: t('adminProfile.manageVideosDesc') || 'Review unlisted YouTube lectures and instructor uploads.',
      icon: Video,
      allowed: true,
      scope: 'All Uploads',
    },
    {
      title: t('adminProfile.permAnalytics') || 'Analytics & System Telemetry',
      desc: t('adminProfile.permAnalyticsDesc') || 'Monitor platform engagement, active enrollments, and traffic analytics.',
      icon: BarChart3,
      allowed: true,
      scope: superAdmin ? 'Global System' : 'Org Analytics',
    },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-[var(--border)] bg-[var(--color-surface-muted)]/50">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">
          {t('adminProfile.rolePermissionsTitle') || 'Administrative Authority Matrix'}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
          {t('adminProfile.rolePermissionsDesc') || 'Overview of capabilities and privileges assigned to your current role.'}
        </p>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {permissions.map((perm, i) => {
          const Icon = perm.icon;
          return (
            <div
              key={i}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                perm.allowed
                  ? 'border-[var(--border)] bg-[var(--card-solid)] hover:border-[var(--primary)]/30'
                  : 'border-[var(--border)] bg-[var(--color-surface-muted)]/50 opacity-60'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  perm.allowed
                    ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'bg-zinc-500/10 text-zinc-400'
                }`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] truncate">
                    {perm.title}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold shrink-0 ${
                      perm.allowed
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                    }`}
                  >
                    {perm.allowed ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" /> Granted
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" /> Restricted
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                  {perm.desc}
                </p>

                <div className="mt-2 pt-2 border-t border-[var(--border)]/60 flex items-center justify-between text-[11px] text-[var(--color-muted-foreground)]">
                  <span>Scope</span>
                  <span className="font-medium text-[var(--color-foreground)]">{perm.scope}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
