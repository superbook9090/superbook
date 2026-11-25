'use client';

import Link from 'next/link';
import { LayoutDashboard, Menu, type LucideIcon } from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import DownloadAppSidebarCard from '@/components/ui/DownloadAppSidebarCard';
import { Button } from '@/components/ui/Button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export interface PublicNavLink {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  matchPrefixes?: string[];
}

export function isPublicLinkActive(pathname: string, link: PublicNavLink): boolean {
  if (pathname === link.href || pathname.startsWith(`${link.href}/`)) return true;
  if (link.matchPrefixes) {
    return link.matchPrefixes.some((prefix) => pathname.startsWith(prefix));
  }
  return false;
}

interface MarketingMobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
  primaryLinks: PublicNavLink[];
  secondaryLinks: PublicNavLink[];
  user?: { name?: string | null; email?: string | null } | null;
}

export default function MarketingMobileDrawer({
  open,
  onOpenChange,
  pathname,
  primaryLinks,
  secondaryLinks,
  user,
}: MarketingMobileDrawerProps) {
  const { t } = useTranslation();
  const close = () => onOpenChange(false);
  const userName = user?.name?.trim() || '';
  const userInitial = userName.charAt(0).toUpperCase() || 'U';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={t('home.header.openMenu')}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)]/85 bg-[var(--card-solid)] text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] transition-all active:scale-95 shadow-xs focus-ring"
        >
          <Menu className="w-5 h-5" />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[86vw] max-w-[340px] p-0 flex flex-col bg-[var(--card-solid)] border-r border-[var(--border)]"
      >
        <SheetHeader className="px-4 py-3.5 pr-12 border-b border-[var(--border)]/80 text-left">
          <SheetTitle className="flex items-center">
            <BrandLogo size="sm" className="text-[var(--color-foreground)]" />
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll px-3 py-3 space-y-4">
          <div className="flex items-center justify-between px-2.5 py-2 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]/80">
            <span className="text-xs font-semibold text-[var(--color-muted-foreground)]">
              {t('common.settings')}
            </span>
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <LanguageSwitcher compact alwaysShowLabel />
            </div>
          </div>

          <nav aria-label={t('topnav.explore')} className="space-y-1">
            <div className="rail-section-label">{t('topnav.explore')}</div>
            {primaryLinks.map((link) => {
              const active = isPublicLinkActive(pathname, link);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rail-link min-h-[44px] px-3 py-2.5 text-sm',
                    active && 'rail-link--active'
                  )}
                >
                  <span className="rail-link__icon">
                    <Icon className="w-[18px] h-[18px]" aria-hidden />
                  </span>
                  <span className="truncate flex-1">{t(link.labelKey)}</span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>

          <nav
            aria-label={t('topnav.resources')}
            className="space-y-1 pt-2 border-t border-[var(--border)]/70"
          >
            <div className="rail-section-label">{t('topnav.resources')}</div>
            {secondaryLinks.map((link) => {
              const active = isPublicLinkActive(pathname, link);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'rail-link min-h-[44px] px-3 py-2.5 text-sm',
                    active && 'rail-link--active'
                  )}
                >
                  <span className="rail-link__icon">
                    <Icon className="w-[18px] h-[18px]" aria-hidden />
                  </span>
                  <span className="truncate flex-1">{t(link.labelKey)}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-shrink-0 p-3 border-t border-[var(--border)]/80 bg-[var(--surface-muted)]/40 space-y-2.5 safe-area-pb">
          <DownloadAppSidebarCard compact />
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[var(--card-solid)] border border-[var(--border)]/80">
                <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {userInitial}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-[var(--color-foreground)] truncate">
                    {userName || user.email}
                  </div>
                  {user.email && (
                    <div className="text-[11px] text-[var(--color-muted-foreground)] truncate">
                      {user.email.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
              <Button asChild className="w-full h-11 rounded-xl gradient-bg text-white">
                <Link href={ROUTES.dashboard} onClick={close}>
                  <LayoutDashboard className="w-4 h-4 mr-1.5" />
                  {t('topnav.openDashboard')}
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-xl bg-[var(--card-solid)]"
              >
                <Link href={ROUTES.login} onClick={close}>
                  {t('home.login')}
                </Link>
              </Button>
              <Button asChild className="h-11 rounded-xl gradient-bg text-white">
                <Link href={ROUTES.register} onClick={close}>
                  {t('home.register')}
                </Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
