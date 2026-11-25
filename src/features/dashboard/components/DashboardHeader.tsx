// src/features/dashboard/components/DashboardHeader.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, ChevronRight, Home } from 'lucide-react';
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

function getSubPageLabelKey(pathname: string, parentHref: string): string | null {
  if (!pathname.startsWith(`${parentHref}/`)) return null;
  const rest = pathname.slice(parentHref.length + 1);
  if (rest === 'create' || rest.endsWith('/create')) return 'common.add';
  if (rest === 'edit' || rest.endsWith('/edit') || rest.startsWith('edit/')) return 'common.edit';
  if (rest.endsWith('/students')) return 'dashboard.students';
  return null;
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
  const subPageKey = activeItem ? getSubPageLabelKey(pathname, activeItem.href) : null;

  const dashboardTitle = isSuperAdminUser
    ? t('topnav.superadminDashboard')
    : isAdminUser
      ? t('admin.adminDashboard')
      : role === 'teacher' || isTeacherOrAdmin
        ? t('dashboard.teacherDashboard')
        : t('dashboard.studentDashboard');

  const workspaceLabel = isSuperAdminUser
    ? t('common.administrator')
    : isAdminUser
      ? t('common.administrator')
      : role === 'teacher' || isTeacherOrAdmin
        ? t('common.teacher')
        : t('common.student');

  const userName = session?.user?.name?.trim() || '';
  const displayName = userName
    ? userName.charAt(0).toUpperCase() + userName.slice(1)
    : workspaceLabel;
  const initial = userName.charAt(0).toUpperCase() || (isTeacherOrAdmin ? 'T' : 'S');
  const notificationsActive = isNavItemActive(pathname, ROUTES.student.notifications);

  return (
    <header className="dashboard-topbar hidden md:block flex-shrink-0">
      <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--gutter-x)] h-16 flex items-center justify-between gap-4">
        {/* Left: Crisp Breadcrumb Trail */}
        <div className="flex items-center gap-2.5 min-w-0">
          {isHomeRoute || !activeItem ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
                <Home className="w-4 h-4" aria-hidden />
              </span>
              <h1 className="text-sm sm:text-base font-bold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)] truncate">
                {dashboardTitle}
              </h1>
            </div>
          ) : (
            <nav aria-label="Breadcrumb" className="flex items-center gap-1 min-w-0">
              <Link
                href={homePath}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] px-2 py-1.5 rounded-[8px] transition-colors shrink-0"
              >
                <Home className="w-3.5 h-3.5 shrink-0" aria-hidden />
                <span>{workspaceLabel}</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--color-muted)]/70 shrink-0" aria-hidden />
              {subPageKey ? (
                <>
                  <Link
                    href={activeItem.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] px-2 py-1.5 rounded-[8px] transition-colors shrink-0"
                  >
                    {ActiveIcon && <ActiveIcon className="w-3.5 h-3.5 shrink-0" aria-hidden />}
                    <span>{t(activeItem.nameKey)}</span>
                  </Link>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--color-muted)]/70 shrink-0" aria-hidden />
                  <span className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] px-1.5 truncate">
                    {t(subPageKey)}
                  </span>
                </>
              ) : (
                <div className="inline-flex items-center gap-2 px-1.5 min-w-0">
                  {ActiveIcon && (
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-[var(--primary-soft)] text-[var(--primary)] shrink-0">
                      <ActiveIcon className="w-3.5 h-3.5" aria-hidden />
                    </span>
                  )}
                  <h1 className="text-sm sm:text-[15px] font-bold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)] truncate">
                    {t(activeItem.nameKey)}
                  </h1>
                </div>
              )}
            </nav>
          )}

          {session?.user?.organizationName && (
            <div className="hidden xl:inline-flex shrink-0">
              <OrganizationBadge
                name={session.user.organizationName}
                logo={session.user.organizationLogo}
                color={session.user.organizationColor}
                variant="pill"
              />
            </div>
          )}
        </div>

        {/* Right: Unified Utility Dock + Clean Profile Chip */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="topbar-dock">
            {showNotifications && (
              <Tooltip label={t('common.notifications')} position="bottom">
                <Link
                  href={ROUTES.student.notifications}
                  aria-label={t('common.notifications')}
                  aria-current={notificationsActive ? 'page' : undefined}
                  className={cn(
                    'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] transition-all active:scale-95 focus-ring',
                    notificationsActive
                      ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-xs'
                      : 'text-[var(--color-muted-foreground)] hover:text-[var(--primary)] hover:bg-[var(--card-solid)]'
                  )}
                >
                  <Bell className="w-4 h-4" />
                </Link>
              </Tooltip>
            )}

            <ThemeToggle variant="ghost" />
            <LanguageSwitcher variant="ghost" compact />
          </div>

          <Tooltip label={t('sidebar.viewProfile')} position="bottom">
            <Link
              href={profileHref}
              className="inline-flex h-10 items-center gap-2.5 pl-1.5 pr-1.5 lg:pr-3 rounded-[10px] hover:bg-[var(--surface-muted)]/90 border border-transparent hover:border-[var(--border)]/75 transition-all focus-ring group"
            >
              <span className="w-7 h-7 rounded-[8px] gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                {initial}
              </span>
              <span className="hidden lg:flex flex-col text-left leading-tight max-w-[120px]">
                <span className="text-xs font-semibold text-[var(--color-foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                  {displayName}
                </span>
                <span className="text-[10px] font-medium text-[var(--color-muted-foreground)] truncate">
                  {workspaceLabel}
                </span>
              </span>
            </Link>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
