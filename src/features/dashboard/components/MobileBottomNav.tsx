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
    <nav className="nav-bottom-bar md:hidden safe-area-pb" aria-label={t('common.dashboard')}>
      <div className="nav-bottom-bar__inner">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = getNavIcon(item.icon);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('nav-bottom-link focus-ring rounded-lg', isActive && 'nav-bottom-link--active')}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5" aria-hidden />
              <span className="text-[10px] mt-0.5 truncate max-w-[4rem] leading-tight">
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
