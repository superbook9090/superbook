'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import {
  Users,
  BookOpen,
  BarChart3,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useSessionStore } from '@/store/useSessionStore';
import { useFeature } from '@/contexts/AppSettingsContext';
import type { FeatureToggleKey } from '@/store/useSettingsStore';

const adminQuickLinks = [
  {
    href: ROUTES.admin.users,
    icon: Users,
    labelKey: 'admin.userManagement' as const,
    titleKey: 'admin.manageUsers' as const,
    iconClass: 'bg-[var(--info-light)] text-[var(--info)] group-hover:bg-[var(--info-light)]/80',
  },
  {
    href: ROUTES.admin.courses,
    icon: BookOpen,
    labelKey: 'admin.allCourses' as const,
    titleKey: 'admin.manageCourses' as const,
    iconClass: 'bg-[var(--success-light)] text-[var(--success)] group-hover:bg-[var(--success-light)]/80',
    feature: 'enableCourses' as FeatureToggleKey,
  },
  {
    href: ROUTES.admin.analytics,
    icon: BarChart3,
    labelKey: 'admin.analytics' as const,
    titleKey: 'admin.systemStats' as const,
    iconClass: 'bg-[var(--student-soft)] text-[var(--student-primary)] group-hover:bg-[var(--student-border)]',
    feature: 'enableAnalytics' as FeatureToggleKey,
  },
  {
    href: ROUTES.admin.settings,
    icon: SettingsIcon,
    labelKey: 'admin.settings' as const,
    titleKey: 'admin.manageSettings' as const,
    iconClass: 'bg-[var(--warning-light)] text-[var(--warning)] group-hover:bg-[var(--warning-light)]/80',
  },
];

export default function AdminDashboardPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const enableCourses = useFeature('enableCourses');
  const enableAnalytics = useFeature('enableAnalytics');

  const visibleLinks = adminQuickLinks.filter((link) => {
    if (!link.feature) return true;
    if (link.feature === 'enableCourses') return enableCourses;
    if (link.feature === 'enableAnalytics') return enableAnalytics;
    return true;
  });

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[var(--student-border)] border-t-[var(--student-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push(ROUTES.login);
    return null;
  }

  return (
    <div className="stack-page overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-[var(--primary-soft)] rounded-xl">
          <SettingsIcon className="w-6 h-6 text-[var(--primary)]" />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{t('admin.adminDashboard')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">{t('admin.adminDesc')}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {visibleLinks.map(({ href, icon: Icon, labelKey, titleKey, iconClass }) => (
          <Link
            key={href}
            href={href}
            className="card-surface card-body hover:shadow-lg transition-all group w-full"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-full transition-colors ${iconClass}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[var(--color-muted-foreground)]">{t(labelKey)}</p>
                <p className="text-lg font-semibold text-[var(--color-foreground)]">{t(titleKey)}</p>
              </div>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
