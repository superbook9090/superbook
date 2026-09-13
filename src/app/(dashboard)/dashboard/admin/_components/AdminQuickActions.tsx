'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
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

const MotionLink = motion(Link);

interface AdminQuickActionsProps {
  isSuperAdmin: boolean;
}

interface ActionItem {
  href: string;
  icon: React.ElementType;
  labelKey: string;
  titleKey: string;
  iconBg: string;
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
          iconBg: 'bg-sky-500/15 text-sky-500 border-sky-500/25',
          show: true,
        },
        {
          href: ROUTES.admin.organizations,
          icon: Building2,
          labelKey: 'common.organizations',
          titleKey: 'common.organizations',
          iconBg: 'bg-amber-500/15 text-amber-500 border-amber-500/25',
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
          iconBg: 'bg-purple-500/15 text-purple-500 border-purple-500/25',
          show: enableCourses,
        },
        {
          href: ROUTES.admin.quizzes,
          icon: HelpCircle,
          labelKey: 'common.quizzes',
          titleKey: 'quiz.myQuizzes',
          iconBg: 'bg-blue-500/15 text-blue-500 border-blue-500/25',
          show: enableQuizzes,
        },
        {
          href: ROUTES.admin.blogs,
          icon: Newspaper,
          labelKey: 'common.blogs',
          titleKey: 'admin.manageBlogs',
          iconBg: 'bg-pink-500/15 text-pink-500 border-pink-500/25',
          show: enableBlogs,
        },
        {
          href: ROUTES.admin.videos,
          icon: Video,
          labelKey: 'admin.videoManagement',
          titleKey: 'admin.videoManagement',
          iconBg: 'bg-rose-500/15 text-rose-500 border-rose-500/25',
          show: true,
        },
        {
          href: ROUTES.admin.notes,
          icon: Notebook,
          labelKey: 'common.notes',
          titleKey: 'dashboard.studyNotes',
          iconBg: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25',
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
          iconBg: 'bg-indigo-500/15 text-indigo-500 border-indigo-500/25',
          show: enableAnalytics,
        },
        {
          href: ROUTES.admin.notifications,
          icon: Bell,
          labelKey: 'common.notifications',
          titleKey: 'common.notifications',
          iconBg: 'bg-amber-500/15 text-amber-500 border-amber-500/25',
          show: isSuperAdmin,
        },
        {
          href: ROUTES.admin.files,
          icon: Folder,
          labelKey: 'common.files',
          titleKey: 'common.files',
          iconBg: 'bg-cyan-500/15 text-cyan-500 border-cyan-500/25',
          show: isSuperAdmin,
        },
        {
          href: ROUTES.admin.settings,
          icon: Settings,
          labelKey: 'admin.settings',
          titleKey: 'admin.manageSettings',
          iconBg: 'bg-slate-500/15 text-slate-500 dark:text-slate-400 border-slate-500/25',
          show: true,
        },
      ],
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.35 }}
      aria-labelledby="admin-ops-heading"
      className="space-y-6"
    >
      <div>
        <h2 id="admin-ops-heading" className="text-base sm:text-lg font-black tracking-tight text-[var(--color-foreground)]">
          {t('dashboard.adminOperations')}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
          {t('dashboard.adminOperationsDesc')}
        </p>
      </div>

      <div className="space-y-5">
        {groups.map((group) => {
          const visibleItems = group.items.filter((item) => item.show);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] px-1">
                <group.icon className="w-3.5 h-3.5" />
                <span>{t(group.titleKey) || group.id}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {visibleItems.map((item, idx) => (
                  <MotionLink
                    key={item.href}
                    href={item.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02, duration: 0.25 }}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="antigravity-glass antigravity-card flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)]/40 hover:shadow-md transition-all duration-300 group min-h-[58px]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 border ${item.iconBg} group-hover:scale-105 transition-transform duration-300 shadow-xs`}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)] truncate">
                          {t(item.labelKey)}
                        </p>
                        <p className="text-xs sm:text-sm font-extrabold text-[var(--color-foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                          {t(item.titleKey)}
                        </p>
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-[var(--surface-muted)] group-hover:bg-[var(--primary-soft)] flex items-center justify-center shrink-0 ml-2 transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] group-hover:text-[var(--primary)] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </MotionLink>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}
