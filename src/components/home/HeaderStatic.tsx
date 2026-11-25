'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Trophy,
  Wrench,
  Newspaper,
  Info,
  Mail,
  HelpCircle,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { useFeature } from '@/contexts/AppSettingsContext';
import { useSessionStore } from '@/store/useSessionStore';
import { cn } from '@/lib/utils';
import ThemeToggle from '@/components/ui/ThemeToggle';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import DownloadAppSidebarCard from '@/components/ui/DownloadAppSidebarCard';
import { Button } from '@/components/ui/Button';
import MarketingMobileDrawer, {
  isPublicLinkActive,
  type PublicNavLink,
} from './MarketingMobileDrawer';

export default function HeaderStatic({ forceScrolled = false }: { forceScrolled?: boolean }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const session = useSessionStore((s) => s.session);
  const enableBlogs = useFeature('enableBlogs');
  const enableCourses = useFeature('enableCourses');
  const enableContests = useFeature('enableContests');

  const [isScrolled, setIsScrolled] = useState(forceScrolled);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (forceScrolled) {
      setIsScrolled(true);
      return;
    }
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [forceScrolled]);

  const primaryLinks = useMemo<PublicNavLink[]>(() => {
    const links: PublicNavLink[] = [];
    if (enableCourses) {
      links.push({ href: ROUTES.courses, labelKey: 'topnav.courses', icon: BookOpen });
    }
    if (enableContests) {
      links.push({ href: ROUTES.contests, labelKey: 'common.contests', icon: Trophy });
    }
    links.push({ href: ROUTES.toolsIndex, labelKey: 'topnav.tools', icon: Wrench });
    if (enableBlogs) {
      links.push({
        href: ROUTES.blogs,
        labelKey: 'common.blogs',
        icon: Newspaper,
        matchPrefixes: ['/blog/'],
      });
    }
    return links;
  }, [enableCourses, enableContests, enableBlogs]);

  const secondaryLinks = useMemo<PublicNavLink[]>(
    () => [
      { href: ROUTES.howItWorks, labelKey: 'home.footer.howItWorks', icon: HelpCircle },
      { href: ROUTES.about, labelKey: 'topnav.about', icon: Info },
      { href: ROUTES.contact, labelKey: 'contact.title', icon: Mail },
    ],
    []
  );

  return (
    <header
      id="site-header"
      className={cn(
        'fixed top-0 left-0 right-0 z-50 safe-area-pt-compact marketing-topbar',
        isScrolled && 'marketing-topbar--scrolled'
      )}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Left: Brand Logo */}
          <Link
            href={ROUTES.home}
            className="flex items-center shrink-0 focus-ring rounded-lg"
            aria-label="Quiz Do"
          >
            <BrandLogo size="md" className="text-[var(--color-foreground)]" />
          </Link>

          {/* Center: Desktop Pill Navigation */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center">
            <div className="topnav-pill-group">
              {primaryLinks.map((link) => {
                const active = isPublicLinkActive(pathname, link);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn('topnav-link', active && 'topnav-link--active')}
                  >
                    {t(link.labelKey)}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Right: Desktop Utility & Auth Actions */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <div className="hidden xl:block">
              <DownloadAppSidebarCard compact />
            </div>
            <ThemeToggle />
            <LanguageSwitcher compact />

            {session ? (
              <Button
                asChild
                size="sm"
                className="h-9 px-4 rounded-xl gradient-bg text-white shadow-sm hover:opacity-95 transition-opacity"
              >
                <Link href={ROUTES.dashboard} className="inline-flex items-center gap-1.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{t('topnav.openDashboard')}</span>
                </Link>
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 pl-1">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3.5 rounded-xl text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                >
                  <Link href={ROUTES.login}>{t('home.login')}</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="h-9 px-4 rounded-xl gradient-bg text-white shadow-sm hover:opacity-95 transition-opacity"
                >
                  <Link href={ROUTES.register} className="inline-flex items-center gap-1">
                    <span>{t('home.register')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Right Cluster + Drawer */}
          <div className="md:hidden flex items-center gap-1.5 shrink-0">
            <ThemeToggle />

            {session ? (
              <Link
                href={ROUTES.dashboard}
                className="inline-flex h-9 items-center gap-1.5 px-3 rounded-xl gradient-bg text-white text-xs font-semibold shadow-xs active:scale-95 transition-transform"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{t('topnav.openDashboard')}</span>
              </Link>
            ) : (
              <Link
                href={ROUTES.login}
                className="inline-flex h-9 items-center px-3 rounded-xl border border-[var(--border)]/85 bg-[var(--card-solid)] text-xs font-semibold text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] shadow-xs active:scale-95 transition-all"
              >
                {t('home.login')}
              </Link>
            )}

            <MarketingMobileDrawer
              open={isOpen}
              onOpenChange={setIsOpen}
              pathname={pathname}
              primaryLinks={primaryLinks}
              secondaryLinks={secondaryLinks}
              user={session?.user}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
