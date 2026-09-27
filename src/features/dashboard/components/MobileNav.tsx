'use client';
import { ROUTES } from '@/constants/routes';

import Link from 'next/link';
import { useState, useMemo, useCallback, memo } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import PremiumLogo from '@/components/ui/PremiumLogo';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LogoutButton from '@/components/ui/LogoutButton';
import Tooltip from '@/components/ui/Tooltip';
import { Menu, Bell } from 'lucide-react';
import type { DashboardNavItem } from '@/constants/navigation';
import { getNavIcon } from '@/lib/navigation/icons';
import { useDashboardNav } from '@/hooks/useDashboardNav';
import { getDashboardHomePath } from '@/lib/roles';
import { cn } from '@/lib/utils';
import DownloadAppSidebarCard from '@/components/ui/DownloadAppSidebarCard';

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
}

interface MobileNavProps {
  user: User | null;
  navigation: DashboardNavItem[];
  adminNavigation?: DashboardNavItem[];
  isSuperAdmin?: boolean;
}

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';

function MobileNavComponent({
  user,
  navigation,
  adminNavigation = [],
  isSuperAdmin = false,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isStaff = ['teacher', 'admin', 'superadmin'].includes(user?.role || '');
  const homePath = getDashboardHomePath(user?.role);
  const { t } = useTranslation();

  const mainItems = useDashboardNav(navigation);
  const adminItems = useDashboardNav(adminNavigation, { isSuperAdmin });

  const headerBg = 'bg-[var(--card-solid)]/95 backdrop-blur-md support-backdrop-blur:bg-[var(--card-solid)]';

  const allNavItems = useMemo(() => {
    if (isStaff && adminItems.length > 0) {
      return [
        ...adminItems,
        { nameKey: 'admin.teacherWorkspace', href: '', icon: 'GraduationCap' as const },
        ...mainItems.slice(0, 5),
      ];
    }
    return mainItems;
  }, [isStaff, mainItems, adminItems]);

  const closeMenu = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <div className={cn(headerBg, 'md:hidden fixed top-0 left-0 right-0 z-50 safe-area-pt-compact border-b border-[var(--border)] shadow-sm transition-all duration-300')}>
        <div className="mobile-header-bar flex items-center justify-between px-4 sm:px-6 h-16 sm:h-20">
          <Link
            href={homePath}
            className="flex items-center gap-2 shrink-0"
          >
            <PremiumLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <Tooltip label={t('common.toggleMenu')} position="bottom">
                <SheetTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card-solid)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-all active:scale-95 shadow-sm"
                    aria-label={t('common.toggleMenu')}
                  >
                    <Menu className="w-4 h-4" />
                  </button>
                </SheetTrigger>
              </Tooltip>
              <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0 flex flex-col bg-[var(--background)] border-r border-[var(--border)]">
                <SheetHeader className="p-4 sm:p-5 pr-12 border-b border-[var(--border)] text-left">
                  <SheetTitle className="flex items-center gap-2">
                    <PremiumLogo size="sm" />
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col justify-between">
                  <div>
                    {/* Quick Actions / Preferences Bar inside drawer */}
                    <div className="flex items-center justify-between p-2 mb-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                      <span className="text-xs font-semibold text-[var(--muted)] px-1">{t('common.settings')}</span>
                      <div className="flex items-center gap-2">
                        {!isStaff && (
                          <Tooltip label={t('common.notifications')} position="bottom">
                            <Link
                              href={ROUTES.student.notifications}
                              onClick={closeMenu}
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card-solid)] text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors shadow-sm"
                              aria-label={t('common.notifications')}
                            >
                              <Bell className="w-4 h-4" />
                            </Link>
                          </Tooltip>
                        )}
                        <ThemeToggle />
                        <LanguageSwitcher compact alwaysShowLabel />
                      </div>
                    </div>

                    <nav className="space-y-1" aria-label={t('common.dashboard')}>
                      {allNavItems.map((item) =>
                        item.href ? (
                          <Link
                            key={item.nameKey + item.href}
                            href={item.href}
                            onClick={closeMenu}
                            className={cn(
                              'flex items-center min-h-[42px] px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors focus-ring',
                              pathname === item.href
                                ? 'bg-[var(--primary-soft)] text-[var(--primary)] font-semibold'
                                : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]'
                            )}
                            aria-current={pathname === item.href ? 'page' : undefined}
                          >
                            <span className="mr-3 p-1 rounded-lg">
                              {(() => {
                                const Icon = getNavIcon(item.icon);
                                return <Icon className="w-4.5 h-4.5" aria-hidden />;
                              })()}
                            </span>
                            {t(item.nameKey)}
                          </Link>
                        ) : (
                          <div
                            key={item.nameKey}
                            className="px-3 py-2 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mt-4 mb-1"
                          >
                            {t(item.nameKey)}
                          </div>
                        )
                      )}
                    </nav>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[var(--border)] space-y-3">
                    <DownloadAppSidebarCard compact />
                    <div className="text-[var(--color-foreground)] px-2">
                      <div className="text-sm font-semibold truncate">{user?.name}</div>
                      <div className="text-xs text-[var(--color-muted-foreground)] truncate">{user?.email}</div>
                    </div>
                    <LogoutButton variant="mobile" />
                  </div>
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
