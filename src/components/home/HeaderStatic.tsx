'use client';

import Link from 'next/link';
import BrandLogo from '@/components/ui/BrandLogo';
import { ROUTES } from '@/constants/routes';
import { translate } from '@/i18n';
import { roleThemes } from '@/lib/roleTheme';
import { useFeature } from '@/contexts/AppSettingsContext';
import ThemeToggle from '@/components/ui/ThemeToggle';
import DownloadAppSidebarCard from '@/components/ui/DownloadAppSidebarCard';

export default function HeaderStatic({ forceScrolled = false }: { forceScrolled?: boolean }) {
  const t = (key: Parameters<typeof translate>[1]) => translate('en', key);
  const theme = roleThemes.student;
  const enableBlogs = useFeature('enableBlogs');

  return (
    <header
      id="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${forceScrolled
        ? 'bg-[var(--card-solid)]/80 backdrop-blur-md border-b border-[var(--border)] shadow-sm'
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
              <Link
                href={ROUTES.login}
                data-i18n-key="home.login"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                {t('home.login')}
              </Link>
              <Link
                href={ROUTES.register}
                data-i18n-key="home.register"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-[var(--student-primary)] hover:bg-white/90 transition-colors"
              >
                {t('home.register')}
              </Link>
            </div>

            <Link
              id="header-auth-session"
              href={ROUTES.dashboard}
              data-i18n-key="common.dashboard"
              className={`hidden px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${theme.gradient} hover:shadow-lg transition-shadow`}
            >
              {t('common.dashboard')}
            </Link>
          </div>

          <div className="md:hidden flex items-center">
            <details className="relative group">
              <summary
                id="mobile-menu-toggle"
                aria-label={t('home.header.openMenu')}
                className="list-none inline-flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card-solid)] text-[var(--foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer [&::-webkit-details-marker]:hidden shadow-sm"
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
              </summary>
              <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-[var(--card-solid)]/95 backdrop-blur-md shadow-xl border border-[var(--border)] p-2.5 flex flex-col gap-2 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <span className="text-xs font-semibold text-[var(--muted)]">Theme</span>
                  <ThemeToggle />
                </div>
                <DownloadAppSidebarCard compact />
                {enableBlogs && (
                  <Link
                    href={ROUTES.blogs}
                    data-i18n-key="common.blogs"
                    className="flex items-center justify-center min-h-[38px] w-full px-3 py-1.5 text-center text-xs sm:text-sm text-[var(--foreground)] font-medium border border-[var(--border)] rounded-lg hover:bg-[var(--surface-muted)] transition-colors"
                  >
                    {t('common.blogs')}
                  </Link>
                )}
                <Link
                  href={ROUTES.login}
                  data-i18n-key="home.login"
                  className="flex items-center justify-center min-h-[38px] w-full px-3 py-1.5 text-center text-xs sm:text-sm text-[var(--foreground)] font-medium border border-[var(--border)] rounded-lg hover:bg-[var(--surface-muted)] transition-colors"
                >
                  {t('home.login')}
                </Link>
                <Link
                  href={ROUTES.register}
                  data-i18n-key="home.register"
                  className={`flex items-center justify-center min-h-[38px] w-full px-3 py-1.5 text-center text-xs sm:text-sm text-white font-semibold bg-gradient-to-r ${theme.gradient} rounded-lg shadow-sm hover:opacity-95 transition-opacity`}
                >
                  {t('home.register')}
                </Link>
                <button
                  id="lang-toggle-mobile"
                  type="button"
                  className="flex items-center justify-center min-h-[38px] w-full px-3 py-1.5 text-center text-xs sm:text-sm text-[var(--muted)] font-medium border border-[var(--border)] rounded-lg hover:bg-[var(--surface-muted)] transition-colors"
                >
                  {t('common.switchToHindi')}
                </button>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
