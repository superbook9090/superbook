'use client';
import { ROUTES } from '@/constants/routes';

import Link from 'next/link';
import { useState, useMemo, useCallback, memo } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useTranslation } from '@/hooks/useTranslation';
import PremiumLogo from '@/components/ui/PremiumLogo';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { Menu, X, LogOut, Bell } from 'lucide-react';
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

  const headerBg = isStaff
    ? 'bg-[var(--teacher-primary)]'
    : 'bg-[var(--student-primary)]';

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
  const handleSignOut = useCallback(() => signOut({ callbackUrl: ROUTES.login }), []);

  return (
    <>
      <div className={cn(headerBg, 'md:hidden fixed top-0 left-0 right-0 z-50 safe-area-pt shadow-[var(--shadow-sm)] border-b border-white/10')}>
        <div className="mobile-header-bar">
          <Link
            href={isStaff ? ROUTES.teacher.root : ROUTES.student.root}
            className="flex items-center gap-[var(--space-3)] touch-target shrink-0"
          >
            <PremiumLogo variant="default" size="md" theme={isStaff ? 'teacher' : 'student'} />
          </Link>
          <div className="flex items-center gap-[var(--space-3)] shrink-0">
            {!isStaff && (
              <Link
                href={ROUTES.student.notifications}
                className="touch-target text-white rounded-lg hover:bg-white/10 transition-colors focus-ring flex items-center justify-center"
                aria-label={t('common.notifications')}
              >
                <Bell className="h-5 w-5" />
              </Link>
            )}
            <LanguageSwitcher compact alwaysShowLabel />
            <button
              type="button"
              onClick={toggleMenu}
              className="touch-target text-white rounded-lg focus-ring active:scale-95 transition-transform flex items-center justify-center"
              aria-label={t('common.toggleMenu')}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className={cn(
            headerBg,
            'md:hidden fixed left-0 right-0 bottom-0 z-40 border-t border-white/20 top-[calc(var(--mobile-header-height)+env(safe-area-inset-top,0px))]'
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
                        ? 'bg-white/20 text-white shadow-[var(--shadow-sm)]'
                        : 'text-white/90 hover:bg-white/10'
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
                    className="px-[var(--space-3)] py-[var(--space-2)] text-xs font-semibold text-white/60 uppercase tracking-wider"
                  >
                    {t(item.nameKey)}
                  </div>
                )
              )}
            </nav>
            <div className="mt-[var(--space-6)] pt-[var(--space-4)] border-t border-white/20">
              <div className="text-white mb-[var(--space-3)] px-[var(--space-4)]">
                <div className="text-base font-medium truncate">{user?.name}</div>
                <div className="text-sm text-white/70 truncate">{user?.email}</div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="mx-[var(--space-2)] w-[calc(100%-var(--space-4))] touch-target bg-white/20 text-white px-[var(--space-4)] py-2.5 rounded-lg text-base font-medium hover:bg-white/30 focus-ring flex items-center justify-center gap-[var(--space-2)]"
              >
                <LogOut className="w-5 h-5" aria-hidden />
                {t('common.signOut')}
              </button>
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
