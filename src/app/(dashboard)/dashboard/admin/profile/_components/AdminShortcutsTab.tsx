'use client';

import React from 'react';
import Link from 'next/link';
import type { Session } from '@/types';
import {
  Users,
  Settings,
  BarChart3,
  Bell,
  Building2,
  BookOpen,
  HelpCircle,
  FileText,
  Newspaper,
  HardDrive,
  Video,
  ChevronRight,
} from 'lucide-react';
import { isSuperAdmin } from '@/lib/roles';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';

interface AdminShortcutsTabProps {
  session: Session;
}

export function AdminShortcutsTab({ session }: AdminShortcutsTabProps) {
  const { t } = useTranslation();
  const superAdmin = isSuperAdmin(session.user?.role);

  const shortcuts = [
    {
      title: t('adminProfile.manageUsers') || 'Manage Users',
      desc: t('adminProfile.manageUsersDesc') || 'Inspect accounts, assign roles, and adjust teacher limits',
      href: ROUTES.admin.users,
      icon: Users,
      color: 'bg-blue-500/10 text-blue-500 hover:border-blue-500/30',
      badge: 'Core',
    },
    {
      title: t('adminProfile.manageSettings') || 'System Settings',
      desc: t('adminProfile.manageSettingsDesc') || 'Toggle feature flags, limits, and maintenance mode',
      href: ROUTES.admin.settings,
      icon: Settings,
      color: 'bg-amber-500/10 text-amber-500 hover:border-amber-500/30',
      badge: superAdmin ? 'Superadmin' : 'Config',
    },
    {
      title: t('adminProfile.viewAnalytics') || 'System Analytics',
      desc: t('adminProfile.viewAnalyticsDesc') || 'Platform metrics, user activity, and performance data',
      href: ROUTES.admin.analytics,
      icon: BarChart3,
      color: 'bg-indigo-500/10 text-indigo-500 hover:border-indigo-500/30',
    },
    ...(superAdmin
      ? [
          {
            title: t('adminProfile.broadcastNotifications') || 'Push Notifications',
            desc: t('adminProfile.broadcastNotificationsDesc') || 'Send instant alerts and push notifications to all users',
            href: ROUTES.admin.notifications,
            icon: Bell,
            color: 'bg-rose-500/10 text-rose-500 hover:border-rose-500/30',
            badge: 'Superadmin',
          },
        ]
      : []),
    {
      title: t('adminProfile.manageOrgs') || 'Organizations',
      desc: t('adminProfile.manageOrgsDesc') || 'Manage registered educational institutions and invite codes',
      href: ROUTES.admin.organizations,
      icon: Building2,
      color: 'bg-teal-500/10 text-teal-500 hover:border-teal-500/30',
    },
    {
      title: t('adminProfile.manageCourses') || 'Courses & Curriculum',
      desc: t('adminProfile.manageCoursesDesc') || 'Review, publish, and manage all courses and lessons',
      href: ROUTES.admin.courses,
      icon: BookOpen,
      color: 'bg-emerald-500/10 text-emerald-500 hover:border-emerald-500/30',
    },
    {
      title: t('adminProfile.manageQuizzes') || 'Quizzes Hub',
      desc: t('adminProfile.manageQuizzesDesc') || 'Oversee quiz assessments and student attempt records',
      href: ROUTES.admin.quizzes,
      icon: HelpCircle,
      color: 'bg-violet-500/10 text-violet-500 hover:border-violet-500/30',
    },
    {
      title: t('adminProfile.manageNotes') || 'Notes & Study Materials',
      desc: t('adminProfile.manageNotesDesc') || 'Supervise curated notes and study documentation',
      href: ROUTES.admin.notes,
      icon: FileText,
      color: 'bg-sky-500/10 text-sky-500 hover:border-sky-500/30',
    },
    {
      title: t('adminProfile.manageBlogs') || 'Blogs & Articles',
      desc: t('adminProfile.manageBlogsDesc') || 'Create, edit, and publish platform announcements and blogs',
      href: ROUTES.admin.blogs,
      icon: Newspaper,
      color: 'bg-orange-500/10 text-orange-500 hover:border-orange-500/30',
    },
    {
      title: t('adminProfile.manageFiles') || 'File Storage Hub',
      desc: t('adminProfile.manageFilesDesc') || 'Centrally browse and manage uploaded storage files',
      href: ROUTES.admin.files,
      icon: HardDrive,
      color: 'bg-fuchsia-500/10 text-fuchsia-500 hover:border-fuchsia-500/30',
    },
    {
      title: t('adminProfile.manageVideos') || 'Video Lectures',
      desc: t('adminProfile.manageVideosDesc') || 'Review unlisted YouTube lectures and instructor uploads',
      href: ROUTES.admin.videos,
      icon: Video,
      color: 'bg-red-500/10 text-red-500 hover:border-red-500/30',
    },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-[var(--border)] bg-[var(--color-surface-muted)]/50">
        <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)]">
          {t('adminProfile.shortcutsTitle') || 'Administrative Navigation Hub'}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
          {t('adminProfile.shortcutsDesc') || 'Quickly jump to core management tools and dashboard workspaces.'}
        </p>
      </div>

      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {shortcuts.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={i}
              href={item.href}
              className={`p-4 rounded-xl border border-[var(--border)] bg-[var(--card-solid)] hover:shadow-sm hover:-translate-y-0.5 transition-all flex items-start gap-3.5 group cursor-pointer ${item.color}`}
            >
              <div className="p-2.5 rounded-xl bg-[var(--card-solid)] shadow-2xs border border-[var(--border)] shrink-0 group-hover:scale-105 transition-transform">
                <Icon className="w-5 h-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                    {item.title}
                  </h3>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] border border-[var(--border)] shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-[var(--color-muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
