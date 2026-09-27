'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useDashboardNav } from '@/hooks/useDashboardNav';
import { MOBILE_BOTTOM_NAV_KEYS, ADMIN_BOTTOM_NAV_KEYS, type DashboardNavItem } from '@/constants/navigation';
import { getNavIcon } from '@/lib/navigation/icons';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  items: DashboardNavItem[];
  isAdminUser?: boolean;
  isSuperAdmin?: boolean;
}

function MobileBottomNavComponent({ items, isAdminUser, isSuperAdmin }: MobileBottomNavProps) {
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
    <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40" aria-label={t('common.dashboard')}>
      <div className="flex items-center justify-around bg-[var(--card-solid)]/90 backdrop-blur-xl border border-[var(--border)] rounded-2xl shadow-xl px-2 py-3 mx-auto max-w-[400px]">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = getNavIcon(item.icon);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[64px] h-12 rounded-xl transition-all duration-300 relative group',
                isActive
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)]'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={t(item.nameKey)}
            >
              {isActive && (
                <span className="absolute -top-1 w-8 h-1 bg-[var(--primary)] rounded-full shadow-[0_0_8px_var(--primary)]" />
              )}
              <Icon className={cn('w-5 h-5 transition-transform duration-300', isActive && 'scale-110')} aria-hidden />
              <span className={cn('text-[10px] font-medium transition-all duration-300', isActive ? 'opacity-100' : 'opacity-70')}>
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
