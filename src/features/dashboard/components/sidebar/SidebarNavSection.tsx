'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { getNavIcon } from '@/lib/navigation/icons';
import type { DashboardNavItem } from '@/constants/navigation';
import Tooltip from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';
import { isNavItemActive } from './sidebarGroups';

interface SidebarNavSectionProps {
  labelKey: string;
  items: DashboardNavItem[];
  pathname: string;
  collapsed?: boolean;
  layoutId?: string;
  variant?: 'desktop' | 'mobile';
  collapsible?: boolean;
  defaultOpen?: boolean;
  headerIcon?: ReactNode;
  showTopDivider?: boolean;
  onNavigate?: () => void;
}

export default function SidebarNavSection({
  labelKey,
  items,
  pathname,
  collapsed = false,
  layoutId = 'sidebarActiveBar',
  variant = 'desktop',
  collapsible = false,
  defaultOpen = true,
  headerIcon,
  showTopDivider = false,
  onNavigate,
}: SidebarNavSectionProps) {
  const { t } = useTranslation();
  const hasActiveChild = items.some((item) => isNavItemActive(pathname, item.href));
  const [isOpen, setIsOpen] = useState(defaultOpen || hasActiveChild);

  if (items.length === 0) return null;

  const isMobile = variant === 'mobile';
  const showItems = collapsed || !collapsible || isOpen;

  return (
    <div
      className={cn(
        '[&:first-child>.rail-collapsed-sep]:hidden',
        showTopDivider && 'pt-3 mt-3 border-t border-[var(--border)]/70'
      )}
    >
      {collapsed && !isMobile ? (
        showTopDivider ? null : (
          <div className="rail-collapsed-sep my-2 mx-3 h-px bg-[var(--border)]/70" aria-hidden />
        )
      ) : collapsible ? (
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="w-full flex items-center justify-between px-2.5 py-1.5 mb-1 rounded-lg text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)]/70 transition-colors"
        >
          <span className="inline-flex items-center gap-1.5 truncate">
            {headerIcon}
            <span className="truncate">{t(labelKey)}</span>
          </span>
          <ChevronDown
            className={cn(
              'w-3.5 h-3.5 shrink-0 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      ) : (
        <div className="rail-section-label flex items-center gap-1.5">
          {headerIcon}
          <span>{t(labelKey)}</span>
        </div>
      )}

      {showItems && (
        <div className={cn('space-y-0.5', collapsed && !isMobile && 'space-y-1')}>
          {items.map((item) => {
            const isActive = isNavItemActive(pathname, item.href);
            const Icon = getNavIcon(item.icon);
            const label = t(item.nameKey);

            const linkEl = (
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? 'page' : undefined}
                aria-label={collapsed && !isMobile ? label : undefined}
                className={cn(
                  'rail-link group focus-ring',
                  isActive && 'rail-link--active',
                  collapsed && !isMobile && 'rail-link--collapsed',
                  isMobile && 'min-h-[44px] px-3 py-2.5 text-sm'
                )}
              >
                {isActive && !collapsed && !isMobile && (
                  <motion.span
                    layoutId={layoutId}
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="rail-link__bar"
                    aria-hidden
                  />
                )}

                <span
                  className={cn(
                    'rail-link__icon',
                    !isActive && 'group-hover:scale-105'
                  )}
                >
                  <Icon className="w-[18px] h-[18px]" aria-hidden />
                </span>

                {(!collapsed || isMobile) && (
                  <span className="truncate flex-1">{label}</span>
                )}

                {isActive && (!collapsed || isMobile) && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0 opacity-85"
                    aria-hidden
                  />
                )}
              </Link>
            );

            if (collapsed && !isMobile) {
              return (
                <div key={item.nameKey + item.href} className="flex justify-center">
                  <Tooltip label={label} position="right">
                    {linkEl}
                  </Tooltip>
                </div>
              );
            }

            return <div key={item.nameKey + item.href}>{linkEl}</div>;
          })}
        </div>
      )}
    </div>
  );
}
