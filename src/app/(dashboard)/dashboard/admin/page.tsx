'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { PageWrapper, PageHeader, ResponsiveGrid } from '@/components/layout';

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
    <PageWrapper>
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className="p-2.5 bg-[var(--primary-soft)] rounded-xl text-[var(--primary)] shrink-0 inline-flex">
              <SettingsIcon className="w-6 h-6" />
            </span>
            <span>{t('admin.adminDashboard')}</span>
          </span>
        }
        description={t('admin.adminDesc')}
      />

      <ResponsiveGrid variant="cards">
        {visibleLinks.map(({ href, icon: Icon, labelKey, titleKey, iconClass }) => (
          <Link
            key={href}
            href={href}
            className="card-surface card-body hover:shadow-md transition-all group w-full hover:-translate-y-0.5 rounded-xl"
          >
            <div className="flex items-center">
              <div className={`p-2 sm:p-2.5 rounded-lg transition-colors shrink-0 ${iconClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="ml-2.5 sm:ml-3 min-w-0 flex-1">
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] truncate">{t(labelKey)}</p>
                <p className="text-sm sm:text-base font-bold text-[var(--color-foreground)] truncate mt-0.5">{t(titleKey)}</p>
              </div>
            </div>
          </Link>
        ))}
      </ResponsiveGrid>
    </PageWrapper>
  );
}
