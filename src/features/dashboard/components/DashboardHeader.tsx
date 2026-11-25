// src/features/dashboard/components/DashboardHeader.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuiz } from '@/contexts/QuizContext';
import { useSessionStore } from '@/store/useSessionStore';
import { getDashboardHomePath, isAdmin, isSuperAdmin } from '@/lib/roles';
import { getNavIcon } from '@/lib/navigation/icons';
import { cn } from '@/lib/utils';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import Tooltip from '@/components/ui/Tooltip';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { OrganizationBadge } from '@/components/organization/OrganizationBadge';
import { isNavItemActive, resolveActiveNavItem } from './sidebar/sidebarGroups';

interface DashboardHeaderProps {
  isTeacherOrAdmin: boolean;
  showNotifications?: boolean;
  role?: string;
}

export default function DashboardHeader({
  isTeacherOrAdmin,
  showNotifications = false,
  role,
}: DashboardHeaderProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { isQuizActive } = useQuiz();
  const session = useSessionStore((s) => s.session);

  if (isQuizActive) return null;

  const isSuperAdminUser = isSuperAdmin(role);
  const isAdminUser = isAdmin(role);
  const homePath = getDashboardHomePath(role);
  const profileHref = isAdminUser
    ? ROUTES.admin.profile
    : isTeacherOrAdmin
      ? ROUTES.teacher.profile
      : ROUTES.student.profile;

  const isHomeRoute = pathname === homePath;
  const activeItem = resolveActiveNavItem(pathname, role);
  const ActiveIcon = activeItem ? getNavIcon(activeItem.icon) : null;

  const getDashboardTitle = () => {
    if (isSuperAdminUser) return t('topnav.superadminDashboard');
    if (isAdminUser) return t('admin.adminDashboard');
    if (role === 'teacher' || isTeacherOrAdmin) return t('dashboard.teacherDashboard');
    return t('dashboard.studentDashboard');
  };

  const getWorkspaceLabel = () => {
    if (isSuperAdminUser) return t('common.administrator');
    if (isAdminUser) return t('common.administrator');
    if (role === 'teacher' || isTeacherOrAdmin) return t('common.teacher');
    return t('common.student');
  };

  const userName = session?.user?.name?.trim() || '';
  const firstName = userName ? userName.split(/\s+/)[0] : '';
  const displayFirstName = firstName
    ? firstName.charAt(0).toUpperCase() + firstName.slice(1)
    : '';
  const initial = userName.charAt(0).toUpperCase() || (isTeacherOrAdmin ? 'T' : 'S');
  const notificationsActive = isNavItemActive(pathname, ROUTES.student.notifications);

  return (
    <header className="dashboard-topbar hidden md:block flex-shrink-0 z-20">
      <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--gutter-x)] h-16 flex items-center justify-between gap-4">
        {/* Left: Breadcrumb / Current Page Context */}
        <div className="flex items-center gap-2.5 min-w-0">
          {isHomeRoute || !activeItem ? (
            <h1 className="text-base font-bold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)] truncate">
              {getDashboardTitle()}
            </h1>
          ) : (
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 min-w-0">
              <Link
                href={homePath}
                className="text-xs font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--primary)] transition-colors shrink-0 px-2 py-1 rounded-lg hover:bg-[var(--surface-muted)]"
              >
                {getWorkspaceLabel()}
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0" aria-hidden />
              <div className="flex items-center gap-2 min-w-0">
                {ActiveIcon && (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
                    <ActiveIcon className="w-4 h-4" aria-hidden />
                  </span>
                )}
                <h1 className="text-sm sm:text-base font-bold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)] truncate">
                  {t(activeItem.nameKey)}
                </h1>
              </div>
            </nav>
          )}

          {session?.user?.organizationName && (
            <div className="hidden lg:inline-flex shrink-0">
              <OrganizationBadge
                name={session.user.organizationName}
                logo={session.user.organizationLogo}
                color={session.user.organizationColor}
                variant="pill"
              />
            </div>
          )}
        </div>

        {/* Right: Unified Utility Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {showNotifications && (
            <Tooltip label={t('common.notifications')} position="bottom">
              <Link
                href={ROUTES.student.notifications}
                aria-label={t('common.notifications')}
                aria-current={notificationsActive ? 'page' : undefined}
                className={cn(
                  'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all active:scale-95 shadow-xs focus-ring',
                  notificationsActive
                    ? 'bg-[var(--primary-soft)] border-[var(--primary)]/35 text-[var(--primary)]'
                    : 'border-[var(--border)]/85 bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)]'
                )}
              >
                <Bell className="w-4 h-4" />
              </Link>
            </Tooltip>
          )}

          <ThemeToggle />
          <LanguageSwitcher compact />

          <span className="h-5 w-px bg-[var(--border)]/80 mx-0.5" aria-hidden />

          <Tooltip label={t('sidebar.viewProfile')} position="bottom">
            <Link
              href={profileHref}
              className="inline-flex h-9 items-center gap-2 pl-1 pr-1 lg:pr-2.5 rounded-xl border border-[var(--border)]/85 bg-[var(--card-solid)] hover:bg-[var(--surface-muted)] transition-all shadow-xs focus-ring group"
            >
              <span className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0 group-hover:scale-105 transition-transform">
                {initial}
              </span>
              {displayFirstName && (
                <span className="hidden lg:inline text-xs font-semibold text-[var(--color-foreground)] max-w-[110px] truncate">
                  {displayFirstName}
                </span>
              )}
            </Link>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
