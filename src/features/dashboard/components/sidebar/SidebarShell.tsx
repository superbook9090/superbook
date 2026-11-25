'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import BrandLogo from '@/components/ui/BrandLogo';
import LogoutButton from '@/components/ui/LogoutButton';
import DownloadAppSidebarCard from '@/components/ui/DownloadAppSidebarCard';
import { OrganizationBadge } from '@/components/organization/OrganizationBadge';
import Tooltip from '@/components/ui/Tooltip';
import { cn } from '@/lib/utils';

export interface SidebarUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
}

interface SidebarShellProps {
  user: SidebarUser | null;
  homePath: string;
  profileHref: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  roleBadgeExpanded: ReactNode;
  roleBadgeCollapsed: ReactNode;
  org?: {
    name?: string | null;
    logo?: string | null;
    color?: string | null;
  };
  topWidgetExpanded?: ReactNode;
  topWidgetCollapsed?: ReactNode;
  avatarFallback?: string;
  children: ReactNode;
}

function formatDisplayName(name?: string | null): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export default function SidebarShell({
  user,
  homePath,
  profileHref,
  collapsed,
  onToggleCollapsed,
  roleBadgeExpanded,
  roleBadgeCollapsed,
  org,
  topWidgetExpanded,
  topWidgetCollapsed,
  avatarFallback = 'U',
  children,
}: SidebarShellProps) {
  const { t } = useTranslation();
  const displayName = formatDisplayName(user?.name) || avatarFallback;
  const initial = user?.name?.trim().charAt(0)?.toUpperCase() || avatarFallback;
  const toggleLabel = collapsed ? t('sidebar.expand') : t('sidebar.collapse');

  return (
    <div
      className={cn(
        'sidebar-rail hidden md:flex',
        collapsed && 'sidebar-rail--collapsed'
      )}
    >
      {/* Top Brand Header */}
      <div
        className={cn(
          'flex items-center flex-shrink-0 h-16 border-b border-[var(--border)]/70',
          collapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}
      >
        <Link
          href={homePath}
          className="flex items-center min-w-0 focus-ring rounded-lg"
          aria-label="Quiz Do"
        >
          <BrandLogo
            size={collapsed ? 'sm' : 'md'}
            withWordmark={!collapsed}
            className="text-[var(--color-foreground)]"
          />
        </Link>

        {!collapsed && (
          <Tooltip label={toggleLabel} position="right">
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={toggleLabel}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] transition-colors focus-ring shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </Tooltip>
        )}
      </div>

      {/* Expand button row when collapsed */}
      {collapsed && (
        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
          <Tooltip label={toggleLabel} position="right">
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={toggleLabel}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] transition-colors focus-ring"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      )}

      {/* Role & Context Strip */}
      <div
        className={cn(
          'flex-shrink-0',
          collapsed ? 'px-2 pt-2 pb-1 flex flex-col items-center gap-2' : 'px-3.5 pt-3 pb-2 space-y-2.5'
        )}
      >
        <div>{collapsed ? roleBadgeCollapsed : roleBadgeExpanded}</div>

        {org?.name && (
          collapsed ? (
            <Tooltip label={org.name} position="right">
              <div
                className="w-9 h-9 rounded-xl border border-[var(--border)] bg-[var(--card-solid)] flex items-center justify-center text-[11px] font-extrabold text-white shadow-xs overflow-hidden"
                style={{
                  backgroundColor: org.logo ? undefined : org.color || 'var(--primary)',
                  borderColor: org.color ? `${org.color}50` : undefined,
                }}
              >
                {org.logo ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={org.logo} alt={org.name} className="w-6 h-6 object-contain" />
                ) : (
                  org.name.slice(0, 2).toUpperCase()
                )}
              </div>
            </Tooltip>
          ) : (
            <OrganizationBadge
              name={org.name}
              logo={org.logo}
              color={org.color}
              variant="card"
            />
          )
        )}

        {collapsed ? topWidgetCollapsed : topWidgetExpanded}
      </div>

      {/* Single Clean Scrollable Navigation Area */}
      <nav
        aria-label={t('common.dashboard')}
        className={cn(
          'flex-1 min-h-0 overflow-y-auto sidebar-scroll py-2',
          collapsed ? 'px-2 space-y-1.5' : 'px-3 space-y-4'
        )}
      >
        {children}
      </nav>

      {/* Fixed Bottom Footer Dock */}
      <div
        className={cn(
          'flex-shrink-0 border-t border-[var(--border)]/70 bg-[var(--surface-muted)]/35',
          collapsed ? 'p-2 space-y-2' : 'p-3 space-y-2'
        )}
      >
        {collapsed ? (
          <div className="flex justify-center">
            <Tooltip label={t('common.downloadApp')} position="right">
              <DownloadAppSidebarCard iconOnly />
            </Tooltip>
          </div>
        ) : (
          <DownloadAppSidebarCard compact />
        )}

        {collapsed ? (
          <div className="flex flex-col items-center gap-1.5 pt-0.5">
            <Tooltip label={`${displayName} · ${t('sidebar.viewProfile')}`} position="right">
              <Link
                href={profileHref}
                aria-label={t('sidebar.viewProfile')}
                className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity focus-ring"
              >
                {initial}
              </Link>
            </Tooltip>
            <Tooltip label={t('common.signOut')} position="right">
              <LogoutButton variant="sidebar" />
            </Tooltip>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2 rounded-xl bg-[var(--card-solid)]/90 border border-[var(--border)]/80 shadow-xs">
            <Link
              href={profileHref}
              className="flex items-center gap-2.5 flex-1 min-w-0 group focus-ring rounded-lg"
            >
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[var(--color-foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                  {displayName}
                </div>
                {user?.email && (
                  <div className="text-[11px] text-[var(--color-muted-foreground)] truncate">
                    {user.email.toLowerCase()}
                  </div>
                )}
              </div>
            </Link>
            <Tooltip label={t('common.signOut')} position="top">
              <LogoutButton variant="sidebar" />
            </Tooltip>
          </div>
        )}
      </div>
    </div>
  );
}
