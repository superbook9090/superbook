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
} from 'lucide-react';
import { useFeature } from '@/contexts/AppSettingsContext';
import { ResponsiveGrid } from '@/components/layout';

const MotionLink = motion(Link);

interface AdminQuickActionsProps {
  isSuperAdmin: boolean;
}

export default function AdminQuickActions({ isSuperAdmin }: AdminQuickActionsProps) {
  const { t } = useTranslation();
  const enableCourses = useFeature('enableCourses');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableBlogs = useFeature('enableBlogs');
  const enableAnalytics = useFeature('enableAnalytics');
  const enableNotes = useFeature('enableNotes');

  const links = [
    {
      href: ROUTES.admin.users,
      icon: Users,
      labelKey: 'admin.userManagement',
      titleKey: 'admin.manageUsers',
      iconBg: 'bg-[var(--info-light)] text-[var(--info)]',
      show: true,
    },
    {
      href: ROUTES.admin.courses,
      icon: BookOpen,
      labelKey: 'admin.allCourses',
      titleKey: 'admin.manageCourses',
      iconBg: 'bg-[var(--success-light)] text-[var(--success)]',
      show: enableCourses,
    },
    {
      href: ROUTES.admin.quizzes,
      icon: HelpCircle,
      labelKey: 'common.quizzes',
      titleKey: 'quiz.myQuizzes',
      iconBg: 'bg-[var(--student-soft)] text-[var(--student-primary)]',
      show: enableQuizzes,
    },
    {
      href: ROUTES.admin.blogs,
      icon: Newspaper,
      labelKey: 'common.blogs',
      titleKey: 'admin.manageBlogs',
      iconBg: 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)]',
      show: enableBlogs,
    },
    {
      href: ROUTES.admin.videos,
      icon: Video,
      labelKey: 'admin.videoManagement',
      titleKey: 'admin.videoManagement',
      iconBg: 'bg-[var(--error-light)] text-[var(--error)]',
      show: true,
    },
    {
      href: ROUTES.admin.notes,
      icon: Notebook,
      labelKey: 'common.notes',
      titleKey: 'dashboard.studyNotes',
      iconBg: 'bg-[var(--warning-light)] text-[var(--warning)]',
      show: enableNotes,
    },
    {
      href: ROUTES.admin.analytics,
      icon: BarChart3,
      labelKey: 'admin.analytics',
      titleKey: 'admin.systemStats',
      iconBg: 'bg-[var(--student-soft)] text-[var(--student-primary)]',
      show: enableAnalytics,
    },
    {
      href: ROUTES.admin.settings,
      icon: Settings,
      labelKey: 'admin.settings',
      titleKey: 'admin.manageSettings',
      iconBg: 'bg-[var(--color-surface-muted-strong)] text-[var(--color-foreground)]',
      show: true,
    },
    // Superadmin specific
    {
      href: ROUTES.admin.organizations,
      icon: Building2,
      labelKey: 'common.organizations',
      titleKey: 'common.organizations',
      iconBg: 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)]',
      show: isSuperAdmin,
    },
    {
      href: ROUTES.admin.notifications,
      icon: Bell,
      labelKey: 'common.notifications',
      titleKey: 'common.notifications',
      iconBg: 'bg-[var(--warning-light)] text-[var(--warning)]',
      show: isSuperAdmin,
    },
    {
      href: ROUTES.admin.files,
      icon: Folder,
      labelKey: 'common.files',
      titleKey: 'common.files',
      iconBg: 'bg-[var(--info-light)] text-[var(--info)]',
      show: isSuperAdmin,
    },
  ].filter((item) => item.show);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      aria-labelledby="admin-ops-heading"
      className="space-y-3 sm:space-y-4"
    >
      <div>
        <h2 id="admin-ops-heading" className="text-lg sm:text-xl font-bold text-[var(--color-foreground)]">
          {t('dashboard.adminOperations')}
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
          {t('dashboard.adminOperationsDesc')}
        </p>
      </div>

      <ResponsiveGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {links.map((link, idx) => (
          <MotionLink
            key={link.href}
            href={link.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + idx * 0.03 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="card-surface card-body flex items-center justify-between p-3 sm:p-4 rounded-xl border border-[var(--border)] hover:border-[var(--teacher-border)] hover:shadow-[var(--shadow-md)] transition-all group min-h-[56px]"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`p-2 sm:p-2.5 rounded-xl shrink-0 ${link.iconBg}`}>
                <link.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-muted)] truncate">
                  {t(link.labelKey)}
                </p>
                <p className="text-sm font-bold text-[var(--color-foreground)] truncate group-hover:text-[var(--teacher-primary)] transition-colors">
                  {t(link.titleKey)}
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[var(--color-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </MotionLink>
        ))}
      </ResponsiveGrid>
    </motion.section>
  );
}
