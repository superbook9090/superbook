'use client';
import { ROUTES } from '@/constants/routes';

import Link from 'next/link';
import { useState, useMemo, useCallback, memo } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import PremiumLogo from '@/components/ui/PremiumLogo';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
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
        <div className="mobile-header-bar">
          <Link
            href={isStaff ? ROUTES.teacher.root : ROUTES.student.root}
            className="flex items-center gap-[var(--space-3)] touch-target shrink-0"
          >
            <PremiumLogo size="md" />
          </Link>
          <div className="flex items-center gap-[var(--space-3)] shrink-0">
            {!isStaff && (
              <Tooltip label={t('common.notifications')} position="bottom">
                <Link
                  href={ROUTES.student.notifications}
                  className="touch-target text-[var(--color-muted-foreground)] rounded-lg hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)] transition-colors focus-ring flex items-center justify-center"
                  aria-label={t('common.notifications')}
                >
                  <Bell className="h-5 w-5" />
                </Link>
              </Tooltip>
            )}
            <LanguageSwitcher compact alwaysShowLabel />
            <Tooltip label={t('common.toggleMenu')} position="bottom">
              <button
                type="button"
                onClick={toggleMenu}
                className="touch-target text-[var(--color-foreground)] rounded-lg focus-ring active:scale-95 transition-transform flex items-center justify-center"
                aria-label={t('common.toggleMenu')}
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
          <div className="h-full overflow-y-auto px-[var(--space-2)] py-[var(--space-4)] pb-24">
            <nav className="space-y-1" aria-label={t('common.dashboard')}>
              {allNavItems.map((item) =>
                item.href ? (
                  <Link
                    key={item.nameKey + item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      'flex items-center min-h-[44px] px-[var(--space-4)] py-[var(--space-3)] text-sm font-medium rounded-xl transition-colors focus-ring',
                      pathname === item.href
                        ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                        : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]'
                    )}
                    aria-current={pathname === item.href ? 'page' : undefined}
                  >
                    <span className="mr-[var(--space-3)] p-1.5 rounded-lg">
                      {(() => {
                        const Icon = getNavIcon(item.icon);
                        return <Icon className="w-5 h-5" aria-hidden />;
                      })()}
                    </span>
                    {t(item.nameKey)}
                  </Link>
                ) : (
                  <div
                    key={item.nameKey}
                    className="px-[var(--space-3)] py-[var(--space-2)] text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider"
                  >
                    {t(item.nameKey)}
                  </div>
                )
              )}
            </nav>
            <div className="mt-[var(--space-6)] pt-[var(--space-4)] border-t border-[var(--border)]">
              <div className="text-[var(--color-foreground)] mb-[var(--space-3)] px-[var(--space-4)]">
                <div className="text-base font-medium truncate">{user?.name}</div>
                <div className="text-sm text-[var(--color-muted-foreground)] truncate">{user?.email}</div>
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
