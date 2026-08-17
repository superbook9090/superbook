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
import { Menu, X, Bell } from 'lucide-react';
import type { DashboardNavItem } from '@/constants/navigation';
import { getNavIcon } from '@/lib/navigation/icons';
import { useDashboardNav } from '@/hooks/useDashboardNav';
import { cn } from '@/lib/utils';

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

function MobileNavComponent({
  user,
  navigation,
  adminNavigation = [],
  isSuperAdmin = false,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isStaff = ['teacher', 'admin', 'superadmin'].includes(user?.role || '');
  const { t } = useTranslation();

  const mainItems = useDashboardNav(navigation);
  const adminItems = useDashboardNav(adminNavigation, { isSuperAdmin });

  const headerBg = 'bg-[var(--card-solid)]';

  const allNavItems = useMemo(() => {
    if (isStaff && adminItems.length > 0) {
      return [
        ...mainItems,
        { nameKey: 'common.administration', href: '', icon: 'LayoutDashboard' as const },
        ...adminItems,
      ];
    }
    return mainItems;
  }, [isStaff, mainItems, adminItems]);

  const toggleMenu = useCallback(() => setIsOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);


  return (
    <>
      <div className={cn(headerBg, 'md:hidden fixed top-0 left-0 right-0 z-50 safe-area-pt shadow-[var(--shadow-sm)] border-b border-[var(--border)]')}>
        <div className="mobile-header-bar flex items-center justify-between px-3">
          <Link
            href={isStaff ? ROUTES.teacher.root : ROUTES.student.root}
            className="flex items-center gap-2 touch-target shrink-0"
          >
            <PremiumLogo size="md" />
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            <Tooltip label={t('common.toggleMenu')} position="bottom">
              <button
                type="button"
                onClick={toggleMenu}
                className="inline-flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card-solid)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-all active:scale-95 shadow-sm"
                aria-label={t('common.toggleMenu')}
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className={cn(
            headerBg,
            'md:hidden fixed left-0 right-0 bottom-0 z-40 border-t border-[var(--border)] top-[calc(var(--mobile-header-height)+env(safe-area-inset-top,0px))]'
          )}
        >
          <div className="h-full overflow-y-auto px-3 py-3 pb-24 flex flex-col justify-between">
            <div>
              {/* Quick Actions / Preferences Bar inside drawer */}
              <div className="flex items-center justify-between p-2 mb-3 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                <span className="text-xs font-semibold text-[var(--muted)]">{t('common.settings')}</span>
                <div className="flex items-center gap-2">
                  {!isStaff && (
                    <Tooltip label={t('common.notifications')} position="bottom">
                      <Link
                        href={ROUTES.student.notifications}
                        onClick={closeMenu}
                        className="inline-flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card-solid)] text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors shadow-sm"
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
                      className="px-3 py-2 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mt-2"
                    >
                      {t(item.nameKey)}
                    </div>
                  )
                )}
              </nav>
            </div>

            <div className="mt-6 pt-3 border-t border-[var(--border)]">
              <div className="text-[var(--color-foreground)] mb-3 px-3">
                <div className="text-sm font-semibold truncate">{user?.name}</div>
                <div className="text-xs text-[var(--color-muted-foreground)] truncate">{user?.email}</div>
              </div>
              <LogoutButton variant="mobile" />
            </div>
          </div>
        </div>
      )}

      <div className="mobile-header-spacer md:hidden" aria-hidden />
    </>
  );
}

const MobileNav = memo(MobileNavComponent);
export default MobileNav;
