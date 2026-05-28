'use client';

import { ROUTES } from '@/constants/routes';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import PremiumLogo from '@/components/ui/PremiumLogo';
import { roleThemes } from '@/lib/roleTheme';
import { Menu, X } from 'lucide-react';
import { supportedLanguages } from '@/i18n/config';
import { useSessionStore } from '@/store/useSessionStore';

export default function Header() {
  const { t, lang, setLang } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session } = useSessionStore();
  const theme = roleThemes.student;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const nextLanguage = supportedLanguages.find((language) => language !== lang) ?? 'en';
    setLang(nextLanguage);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          isScrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <Link href={ROUTES.home} className="flex items-center gap-2">
              <PremiumLogo
                variant="default"
                size="md"
                theme={isScrolled ? 'white' : 'student'}
                priority
              />
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <button
                type="button"
                onClick={toggleLanguage}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isScrolled
                    ? 'text-gray-600 hover:bg-gray-100'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                {lang === 'en' ? 'EN' : 'HI'}
              </button>

              {session ? (
                <Link
                  href={ROUTES.dashboard}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${theme.gradient} hover:shadow-lg transition-shadow`}
                >
                  {t('common.dashboard')}
                </Link>
              ) : (
                <>
                  <Link
                    href={ROUTES.login}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isScrolled
                        ? 'text-gray-600 hover:text-gray-900'
                        : 'text-white hover:text-white'
                    }`}
                  >
                    {t('home.login')}
                  </Link>
                  <Link
                    href={ROUTES.register}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isScrolled
                        ? `bg-gradient-to-r ${theme.gradient} text-white hover:shadow-lg`
                        : 'bg-white text-[var(--student-primary)] hover:bg-white/90'
                    }`}
                  >
                    {t('home.register')}
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-nav-menu"
              className={`md:hidden p-2 rounded-lg transition-colors ${
                isScrolled
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <div
          id="mobile-nav-menu"
          className="fixed inset-x-0 top-16 z-40 md:hidden bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="px-4 py-6 space-y-4">
            {session ? (
              <Link
                href={ROUTES.dashboard}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block w-full py-3 text-center text-white font-semibold bg-gradient-to-r ${theme.gradient} rounded-xl`}
              >
                {t('common.dashboard')}
              </Link>
            ) : (
              <>
                <Link
                  href={ROUTES.login}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full py-3 text-center text-gray-700 font-medium border border-gray-200 rounded-xl hover:bg-gray-50"
                >
                  {t('home.login')}
                </Link>
                <Link
                  href={ROUTES.register}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block w-full py-3 text-center text-white font-semibold bg-gradient-to-r ${theme.gradient} rounded-xl`}
                >
                  {t('home.register')}
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                toggleLanguage();
                setIsMobileMenuOpen(false);
              }}
              className="block w-full py-3 text-center text-gray-600 font-medium border border-gray-200 rounded-xl hover:bg-gray-50"
            >
              {lang === 'en' ? t('common.switchToHindi') : t('common.switchToEnglish')}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
