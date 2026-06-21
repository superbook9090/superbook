'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';
import { translate } from '@/i18n';
import { roleThemes } from '@/lib/roleTheme';

export default function HeaderStatic({ forceScrolled = false }: { forceScrolled?: boolean }) {
  const t = (key: Parameters<typeof translate>[1]) => translate('en', key);
  const theme = roleThemes.student;

  return (
    <header
      id="site-header"
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        forceScrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href={ROUTES.home} className="flex items-center gap-2">
            <div className="flex items-center px-3 py-2 rounded-xl bg-white/90 shadow-sm">
              <Image
                src="/logo.svg"
                alt="Quiz-Do logo"
                width={96}
                height={52}
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-4">
            <Link
              id="header-blogs-link"
              href={ROUTES.blogs}
              data-i18n-key="common.blogs"
              className={`header-nav-btn ${forceScrolled ? 'header-nav-btn-dark' : 'header-nav-btn-light'}`}
            >
              {t('common.blogs')}
            </Link>
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  forceScrolled ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-white'
                }`}
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

          <details className="md:hidden relative group">
            <summary
              id="mobile-menu-toggle"
              aria-label="Open menu"
              className={`list-none p-2 rounded-lg transition-colors cursor-pointer [&::-webkit-details-marker]:hidden ${
                forceScrolled ? 'text-gray-800 hover:bg-black/5' : 'text-white hover:bg-white/10'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white shadow-lg border border-gray-100 p-4 space-y-3">
              <Link
                href={ROUTES.blogs}
                data-i18n-key="common.blogs"
                className="block w-full py-2.5 text-center text-gray-700 font-medium border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                {t('common.blogs')}
              </Link>
              <Link
                href={ROUTES.login}
                data-i18n-key="home.login"
                className="block w-full py-2.5 text-center text-gray-700 font-medium border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                {t('home.login')}
              </Link>
              <Link
                href={ROUTES.register}
                data-i18n-key="home.register"
                className={`block w-full py-2.5 text-center text-white font-semibold bg-gradient-to-r ${theme.gradient} rounded-xl`}
              >
                {t('home.register')}
              </Link>
              <button
                id="lang-toggle-mobile"
                type="button"
                className="block w-full py-2.5 text-center text-gray-600 font-medium border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                {t('common.switchToHindi')}
              </button>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
