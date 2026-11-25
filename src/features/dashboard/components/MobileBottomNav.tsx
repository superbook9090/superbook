'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDashboardNav } from '@/hooks/useDashboardNav';
import {
  MOBILE_BOTTOM_NAV_KEYS,
  ADMIN_BOTTOM_NAV_KEYS,
  type DashboardNavItem,
} from '@/constants/navigation';
import { getNavIcon } from '@/lib/navigation/icons';
import { cn } from '@/lib/utils';
import { isNavItemActive } from './sidebar/sidebarGroups';

interface MobileBottomNavProps {
  items: DashboardNavItem[];
  isAdminUser?: boolean;
  isSuperAdmin?: boolean;
}

function MobileBottomNavComponent({
  items,
  isAdminUser,
  isSuperAdmin,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const filtered = useDashboardNav(items, { isSuperAdmin });

  const bottomNavItems = useMemo(() => {
    const keysToUse = isAdminUser ? ADMIN_BOTTOM_NAV_KEYS : MOBILE_BOTTOM_NAV_KEYS;
    const keySet = new Set<string>(keysToUse);
    const preferred = filtered.filter((item) => keySet.has(item.nameKey));
    return preferred.length > 0 ? preferred.slice(0, 5) : filtered.slice(0, 5);
  }, [filtered, isAdminUser]);

  return (
    <nav
      className="md:hidden fixed bottom-3 left-3 right-3 z-40 safe-area-pb"
      aria-label={t('common.dashboard')}
    >
      <div className="flex items-center justify-between gap-1 bg-[var(--card-solid)]/92 backdrop-blur-xl border border-[var(--border)]/85 rounded-2xl shadow-xl px-1.5 py-1.5 mx-auto max-w-[440px]">
        {bottomNavItems.map((item) => {
          const isActive = isNavItemActive(pathname, item.href);
          const Icon = getNavIcon(item.icon);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 h-12 px-1 rounded-xl transition-all duration-200 relative group focus-ring',
                isActive
                  ? 'bg-[var(--primary-soft)] text-[var(--primary)]'
                  : 'text-[var(--color-muted-foreground)] hover:bg-[var(--surface-muted)] hover:text-[var(--color-foreground)]'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={t(item.nameKey)}
            >
              {isActive && (
                <span className="absolute top-0.5 w-6 h-0.5 bg-[var(--primary)] rounded-full" />
              )}
              <Icon
                className={cn(
                  'w-[18px] h-[18px] shrink-0 transition-transform duration-200',
                  isActive && 'scale-105'
                )}
                aria-hidden
              />
              <span
                className={cn(
                  'text-[10px] leading-tight truncate max-w-full px-0.5',
                  isActive ? 'font-bold opacity-100' : 'font-medium opacity-80'
                )}
              >
                {t(item.nameKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

const MobileBottomNav = memo(MobileBottomNavComponent);
export default MobileBottomNav;
