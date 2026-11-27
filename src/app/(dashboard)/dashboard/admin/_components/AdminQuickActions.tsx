'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import {
  Users,
  BookOpen,
  HelpCircle,
  Newspaper,
  Video,
  Notebook,
  BarChart3,
  Settings,
  Building2,
  Bell,
  Folder,
  ArrowRight,
  Shield,
  GraduationCap,
  Cpu,
} from 'lucide-react';
import { useFeature } from '@/contexts/AppSettingsContext';

interface AdminQuickActionsProps {
  isSuperAdmin: boolean;
}

interface ActionItem {
  href: string;
  icon: React.ElementType;
  labelKey: string;
  titleKey: string;
  iconTone: string;
  show: boolean;
}

interface ActionGroup {
  id: string;
  titleKey: string;
  icon: React.ElementType;
  items: ActionItem[];
}

export default function AdminQuickActions({ isSuperAdmin }: AdminQuickActionsProps) {
  const { t } = useTranslation();
  const enableCourses = useFeature('enableCourses');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableBlogs = useFeature('enableBlogs');
  const enableAnalytics = useFeature('enableAnalytics');
  const enableNotes = useFeature('enableNotes');

  const groups: ActionGroup[] = [
    {
      id: 'identity',
      titleKey: 'admin.identityTenancy',
      icon: Shield,
      items: [
        {
          href: ROUTES.admin.users,
          icon: Users,
          labelKey: 'admin.userManagement',
          titleKey: 'admin.manageUsers',
          iconTone: 'bg-sky-500/12 text-sky-600 dark:text-sky-400 border-sky-500/20',
          show: true,
        },
        {
          href: ROUTES.admin.organizations,
          icon: Building2,
          labelKey: 'common.organizations',
          titleKey: 'common.organizations',
          iconTone: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/20',
          show: isSuperAdmin,
        },
      ],
    },
    {
      id: 'academic',
      titleKey: 'admin.academicContent',
      icon: GraduationCap,
      items: [
        {
          href: ROUTES.admin.courses,
          icon: BookOpen,
          labelKey: 'admin.allCourses',
          titleKey: 'admin.manageCourses',
          iconTone: 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border-[var(--teacher-border)]',
          show: enableCourses,
        },
        {
          href: ROUTES.admin.quizzes,
          icon: HelpCircle,
          labelKey: 'common.quizzes',
          titleKey: 'quiz.myQuizzes',
          iconTone: 'bg-blue-500/12 text-blue-600 dark:text-blue-400 border-blue-500/20',
          show: enableQuizzes,
        },
        {
          href: ROUTES.admin.blogs,
          icon: Newspaper,
          labelKey: 'common.blogs',
          titleKey: 'admin.manageBlogs',
          iconTone: 'bg-pink-500/12 text-pink-600 dark:text-pink-400 border-pink-500/20',
          show: enableBlogs,
        },
        {
          href: ROUTES.admin.videos,
          icon: Video,
          labelKey: 'admin.videoManagement',
          titleKey: 'admin.videoManagement',
          iconTone: 'bg-rose-500/12 text-rose-600 dark:text-rose-400 border-rose-500/20',
          show: true,
        },
        {
          href: ROUTES.admin.notes,
          icon: Notebook,
          labelKey: 'common.notes',
          titleKey: 'dashboard.studyNotes',
          iconTone: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
          show: enableNotes,
        },
      ],
    },
    {
      id: 'platform',
      titleKey: 'admin.platformControl',
      icon: Cpu,
      items: [
        {
          href: ROUTES.admin.analytics,
          icon: BarChart3,
          labelKey: 'admin.analytics',
          titleKey: 'admin.systemStats',
          iconTone: 'bg-indigo-500/12 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
          show: enableAnalytics,
        },
        {
          href: ROUTES.admin.notifications,
          icon: Bell,
          labelKey: 'common.notifications',
          titleKey: 'common.notifications',
          iconTone: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/20',
          show: isSuperAdmin,
        },
        {
          href: ROUTES.admin.files,
          icon: Folder,
          labelKey: 'common.files',
          titleKey: 'common.files',
          iconTone: 'bg-cyan-500/12 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
          show: isSuperAdmin,
        },
        {
          href: ROUTES.admin.settings,
          icon: Settings,
          labelKey: 'admin.settings',
          titleKey: 'admin.manageSettings',
          iconTone: 'bg-[var(--surface-muted)] text-[var(--color-foreground)] border-[var(--border)]',
          show: isSuperAdmin,
        },
      ],
    },
  ];

  return (
    <section aria-labelledby="admin-ops-heading" className="space-y-4">
      <div>
        <h2
          id="admin-ops-heading"
          className="text-base sm:text-lg font-extrabold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)]"
        >
          {t('dashboard.adminOperations')}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
          {t('dashboard.adminOperationsDesc')}
        </p>
      </div>

      <div className="space-y-4">
        {groups.map((group) => {
          const visibleItems = group.items.filter((item) => item.show);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.id} className="space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] px-0.5">
                <group.icon className="w-3.5 h-3.5" />
                <span>{t(group.titleKey) || group.id}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {visibleItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="teacher-card flex items-center justify-between gap-3 p-3.5 sm:p-4 min-h-[64px] group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-[10px] shrink-0 border ${item.iconTone}`}
                      >
                        <item.icon className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] truncate">
                          {t(item.labelKey)}
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] truncate group-hover:text-[var(--teacher-primary)] transition-colors">
                          {t(item.titleKey)}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex h-8 w-8 rounded-[8px] bg-[var(--surface-muted)] group-hover:bg-[var(--teacher-soft)] items-center justify-center shrink-0 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] group-hover:text-[var(--teacher-primary)] group-hover:translate-x-0.5 transition-all" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
