'use client';

import Link from 'next/link';
import { useState, useMemo, useCallback, memo } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Bell, Crown, Shield, GraduationCap, Sparkles } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import type { DashboardNavItem } from '@/constants/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useDashboardNav } from '@/hooks/useDashboardNav';
import { getDashboardHomePath, isAdmin, isStaffRole } from '@/lib/roles';
import { useSessionStore } from '@/store/useSessionStore';
import { cn } from '@/lib/utils';
import BrandLogo from '@/components/ui/BrandLogo';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LogoutButton from '@/components/ui/LogoutButton';
import DownloadAppSidebarCard from '@/components/ui/DownloadAppSidebarCard';
import { OrganizationBadge } from '@/components/organization/OrganizationBadge';
import StreakBadge from '@/components/gamification/StreakBadge';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import SidebarNavSection from './sidebar/SidebarNavSection';
import {
  groupAdminNav, groupStudentNav, groupTeacherNav, isNavItemActive, resolveActiveNavItem,
} from './sidebar/sidebarGroups';

interface User { id?: string; name?: string | null; email?: string | null; role?: string; }

interface MobileNavProps {
  user: User | null;
  navigation: DashboardNavItem[];
  adminNavigation?: DashboardNavItem[];
  isSuperAdmin?: boolean;
}

function MobileNavComponent({ user, navigation, adminNavigation = [], isSuperAdmin = false }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isStaff = isStaffRole(user?.role);
  const isAdminUser = isAdmin(user?.role);
  const homePath = getDashboardHomePath(user?.role);
  const profileHref = isAdminUser
    ? ROUTES.admin.profile
    : isStaff
      ? ROUTES.teacher.profile
      : ROUTES.student.profile;
  const { t } = useTranslation();

  const mainItems = useDashboardNav(navigation);
  const adminItems = useDashboardNav(adminNavigation, { isSuperAdmin });

  const sessionUser = useSessionStore((s) => s.session?.user);
  const orgName = sessionUser?.organizationName;
  const orgLogo = sessionUser?.organizationLogo;
  const orgColor = sessionUser?.organizationColor;

  const navGroups = useMemo(() => {
    if (isStaff && adminItems.length > 0) return groupAdminNav(adminItems);
    if (isStaff) return groupTeacherNav(mainItems);
    return groupStudentNav(mainItems);
  }, [isStaff, mainItems, adminItems]);

  const teacherWorkspaceItems = useMemo(
    () => (isStaff && adminItems.length > 0 ? mainItems.slice(0, 5) : []),
    [isStaff, adminItems.length, mainItems]
  );

  const isHomeRoute = pathname === homePath;
  const activeItem = useMemo(() => resolveActiveNavItem(pathname, user?.role), [pathname, user?.role]);
  const notificationsActive = isNavItemActive(pathname, ROUTES.student.notifications);

  const closeMenu = useCallback(() => setIsOpen(false), []);
  const displayName = user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : '';
  const initial = user?.name?.trim().charAt(0)?.toUpperCase() || (isStaff ? 'T' : 'S');
  const RoleIcon = isSuperAdmin ? Crown : isAdminUser ? Shield : isStaff ? GraduationCap : Sparkles;
  const roleLabel = isSuperAdmin
    ? t('admin.superadminTier')
    : isAdminUser
      ? t('common.administrator')
      : isStaff
        ? t('common.teacher')
        : t('common.student');

  return (
    <>
      <div className="dashboard-topbar md:hidden fixed top-0 left-0 right-0 z-50 safe-area-pt-compact shadow-xs">
        <div className="flex items-center justify-between gap-2 px-3.5 sm:px-5 h-14">
          {/* Left: Brand & Active Route Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Link href={homePath} className="flex items-center shrink-0 focus-ring rounded-lg">
              <BrandLogo
                size="sm"
                withWordmark={isHomeRoute || !activeItem}
                className="text-[var(--color-foreground)]"
              />
            </Link>
            {!isHomeRoute && activeItem && (
              <>
                <span className="h-4 w-px bg-[var(--border)] shrink-0" aria-hidden />
                <span className="text-sm font-bold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)] truncate">
                  {t(activeItem.nameKey)}
                </span>
              </>
            )}
          </div>

          {/* Right: Quick Controls + Drawer Trigger */}
          <div className="flex items-center gap-1.5 shrink-0">
            {!isStaff && (
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
            )}

            <ThemeToggle />

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)]/85 bg-[var(--card-solid)] text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] transition-all active:scale-95 shadow-xs focus-ring"
                  aria-label={t('common.toggleMenu')}
                >
                  <Menu className="w-5 h-5" />
                </button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="w-[86vw] max-w-[340px] p-0 flex flex-col bg-[var(--card-solid)] border-r border-[var(--border)]"
              >
                <SheetHeader className="px-4 py-3.5 pr-12 border-b border-[var(--border)]/80 text-left">
                  <SheetTitle className="flex items-center justify-between gap-2">
                    <BrandLogo size="sm" className="text-[var(--color-foreground)]" />
                    <span
                      className={cn(
                        'rail-chip text-[10px] py-0.5 px-2',
                        isSuperAdmin && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      )}
                    >
                      <RoleIcon className={cn('w-3 h-3', isSuperAdmin && 'text-amber-500')} />
                      <span>{roleLabel}</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll px-3 py-3 space-y-3">
                  <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]/80">
                    <span className="text-xs font-semibold text-[var(--color-muted-foreground)]">
                      {t('common.settings')}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <ThemeToggle />
                      <LanguageSwitcher compact alwaysShowLabel />
                    </div>
                  </div>

                  {orgName && (
                    <OrganizationBadge name={orgName} logo={orgLogo} color={orgColor} variant="card" />
                  )}

                  {!isStaff && <StreakBadge />}

                  <nav className="space-y-4 pt-1" aria-label={t('common.dashboard')}>
                    {navGroups.map((group) => (
                      <SidebarNavSection
                        key={group.id}
                        labelKey={group.labelKey}
                        items={group.items}
                        pathname={pathname}
                        variant="mobile"
                        onNavigate={closeMenu}
                      />
                    ))}

                    {teacherWorkspaceItems.length > 0 && (
                      <SidebarNavSection
                        labelKey="admin.teacherWorkspace"
                        items={teacherWorkspaceItems}
                        pathname={pathname}
                        variant="mobile"
                        collapsible
                        defaultOpen={false}
                        showTopDivider
                        headerIcon={<GraduationCap className="w-3.5 h-3.5 shrink-0" />}
                        onNavigate={closeMenu}
                      />
                    )}
                  </nav>
                </div>

                <div className="flex-shrink-0 p-3 border-t border-[var(--border)]/80 bg-[var(--surface-muted)]/40 space-y-2.5 safe-area-pb">
                  <DownloadAppSidebarCard compact />
                  <Link
                    href={profileHref}
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--card-solid)] border border-[var(--border)]/80 focus-ring"
                  >
                    <div className="w-9 h-9 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-[var(--color-foreground)] truncate">
                        {displayName || user?.name}
                      </div>
                      {user?.email && (
                        <div className="text-xs text-[var(--color-muted-foreground)] truncate">
                          {user.email.toLowerCase()}
                        </div>
                      )}
                    </div>
                  </Link>
                  <LogoutButton variant="mobile" />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="mobile-header-spacer md:hidden" aria-hidden />
    </>
  );
}

const MobileNav = memo(MobileNavComponent);
export default MobileNav;
