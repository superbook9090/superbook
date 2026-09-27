'use client';

import Link from 'next/link';
import BrandLogo from '@/components/ui/BrandLogo';
import { ROUTES } from '@/constants/routes';
import { translate } from '@/i18n';
import { roleThemes } from '@/lib/roleTheme';
import { useFeature } from '@/contexts/AppSettingsContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import DownloadAppSidebarCard from '@/components/ui/DownloadAppSidebarCard';
import { Button } from '@/components/ui/Button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function HeaderStatic({ forceScrolled = false }: { forceScrolled?: boolean }) {
  const t = (key: Parameters<typeof translate>[1]) => translate('en', key);
  const theme = roleThemes.student;
  const enableBlogs = useFeature('enableBlogs');

  return (
    <header
      id="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${forceScrolled
        ? 'bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-[var(--border)] shadow-sm'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href={ROUTES.home} className="flex items-center gap-2">
            <div className="flex items-center">
              <BrandLogo size="md" className="text-[var(--color-foreground)]" />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <DownloadAppSidebarCard compact />
            <ThemeToggle />
            <Link
              id="header-contests-link"
              href={ROUTES.contests}
              data-i18n-key="common.contests"
              className={`header-nav-btn ${forceScrolled ? 'header-nav-btn-dark' : 'header-nav-btn-light'}`}
            >
              {t('common.contests')}
            </Link>
            {enableBlogs && (
              <Link
                id="header-blogs-link"
                href={ROUTES.blogs}
                data-i18n-key="common.blogs"
                className={`header-nav-btn ${forceScrolled ? 'header-nav-btn-dark' : 'header-nav-btn-light'}`}
              >
                {t('common.blogs')}
              </Link>
            )}
            <button
              id="lang-toggle"
              type="button"
              className={`header-nav-btn ${forceScrolled ? 'header-nav-btn-dark' : 'header-nav-btn-light'}`}
            >
              EN
            </button>

            <div id="header-auth-guest" className="flex items-center gap-4">
              <Button asChild variant="ghost" className="text-[var(--muted)] hover:text-[var(--foreground)]">
                <Link href={ROUTES.login} data-i18n-key="home.login">
                  {t('home.login')}
                </Link>
              </Button>
              <Button asChild className={`bg-gradient-to-r ${theme.gradient} text-white shadow-md hover:shadow-lg transition-shadow`}>
                <Link href={ROUTES.register} data-i18n-key="home.register">
                  {t('home.register')}
                </Link>
              </Button>
            </div>

            <Button
              asChild
              id="header-auth-session"
              className={`hidden bg-gradient-to-r ${theme.gradient} text-white shadow-md hover:shadow-lg transition-shadow`}
            >
              <Link href={ROUTES.dashboard} data-i18n-key="common.dashboard">
                {t('common.dashboard')}
              </Link>
            </Button>
          </div>

          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  id="mobile-menu-toggle"
                  aria-label={t('home.header.openMenu')}
                  className="inline-flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card-solid)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer shadow-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0 flex flex-col bg-[var(--background)] border-r border-[var(--border)]">
                <div className="p-4 sm:p-5 border-b border-[var(--border)] text-left">
                  <div className="flex items-center gap-2">
                    <BrandLogo size="sm" />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col justify-between">
                  <div>
                    {/* Settings Bar */}
                    <div className="flex items-center justify-between p-2 mb-4 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
                      <span className="text-xs font-semibold text-[var(--muted)] px-1">Settings</span>
                      <div className="flex items-center gap-2">
                        <ThemeToggle />
                        {/* Language Switcher missing component import, so using the button style for now, but formatted nicely */}
                        <button
                          id="lang-toggle-mobile"
                          type="button"
                          className="inline-flex h-8 px-2 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card-solid)] text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors shadow-sm"
                        >
                          EN / HI
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                      <Link
                        href={ROUTES.contests}
                        className="flex items-center min-h-[42px] px-4 py-2.5 text-sm font-medium rounded-xl text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors border border-transparent hover:border-[var(--border)]"
                      >
                        {t('common.contests')}
                      </Link>
                      
                      {enableBlogs && (
                        <Link
                          href={ROUTES.blogs}
                          className="flex items-center min-h-[42px] px-4 py-2.5 text-sm font-medium rounded-xl text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors border border-transparent hover:border-[var(--border)]"
                        >
                          {t('common.blogs')}
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[var(--border)] flex flex-col gap-3">
                    <DownloadAppSidebarCard compact />
                    <div className="flex flex-col gap-3 bg-[var(--surface-muted)]/30 p-3 rounded-xl border border-[var(--border)]/50 mt-2">
                      <Button asChild variant="outline" className="w-full justify-center h-11 bg-[var(--card-solid)]">
                        <Link href={ROUTES.login}>
                          {t('home.login')}
                        </Link>
                      </Button>
                      <Button asChild className={`w-full justify-center h-11 bg-gradient-to-r ${theme.gradient} text-white`}>
                        <Link href={ROUTES.register}>
                          {t('home.register')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
