'use client';

import { useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { translate } from '@/i18n';
import { supportedLanguages } from '@/i18n/config';
import { useSessionStore } from '@/store/useSessionStore';

export default function HeaderEnhancements({ forceScrolled = false }: { forceScrolled?: boolean }) {
  const { lang, setLang } = useTranslation();
  const session = useSessionStore((s) => s.session);

  useEffect(() => {
    const header = document.getElementById('site-header');
    if (!header) return;

    const onScroll = () => {
      const scrolled = forceScrolled || window.scrollY > 20;
      header.classList.toggle('bg-white/90', scrolled);
      header.classList.toggle('backdrop-blur-lg', scrolled);
      header.classList.toggle('shadow-sm', scrolled);
      header.classList.toggle('bg-transparent', !scrolled);

      const toggleNavBtn = (el: HTMLElement | null) => {
        if (!el) return;
        el.classList.toggle('header-nav-btn-dark', scrolled);
        el.classList.toggle('header-nav-btn-light', !scrolled);
      };

      toggleNavBtn(document.getElementById('lang-toggle'));
      toggleNavBtn(document.getElementById('header-blogs-link'));

      header.querySelectorAll<HTMLElement>('#header-auth-guest a').forEach((link) => {
        if (link.classList.contains('bg-white')) return;
        link.classList.toggle('text-gray-600', scrolled);
        link.classList.toggle('hover:text-gray-900', scrolled);
        link.classList.toggle('text-white', !scrolled);
      });

      const mobileToggle = document.getElementById('mobile-menu-toggle');
      if (mobileToggle) {
        mobileToggle.classList.toggle('text-gray-800', scrolled);
        mobileToggle.classList.toggle('hover:bg-black/5', scrolled);
        mobileToggle.classList.toggle('text-white', !scrolled);
        mobileToggle.classList.toggle('hover:bg-white/10', !scrolled);
      }
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [forceScrolled]);

  useEffect(() => {
    const toggleLanguage = () => {
      const nextLanguage = supportedLanguages.find((language) => language !== lang) ?? 'en';
      setLang(nextLanguage);
    };

    const langToggle = document.getElementById('lang-toggle');
    const langToggleMobile = document.getElementById('lang-toggle-mobile');
    langToggle?.addEventListener('click', toggleLanguage);
    langToggleMobile?.addEventListener('click', toggleLanguage);

    if (langToggle) {
      langToggle.textContent = lang === 'en' ? 'EN' : 'HI';
    }
    if (langToggleMobile) {
      langToggleMobile.textContent = translate(
        lang,
        lang === 'en' ? 'common.switchToHindi' : 'common.switchToEnglish'
      );
    }

    return () => {
      langToggle?.removeEventListener('click', toggleLanguage);
      langToggleMobile?.removeEventListener('click', toggleLanguage);
    };
  }, [lang, setLang]);

  useEffect(() => {
    const guest = document.getElementById('header-auth-guest');
    const sessionLink = document.getElementById('header-auth-session');
    if (!guest || !sessionLink) return;

    if (session) {
      guest.classList.add('hidden');
      sessionLink.classList.remove('hidden');
      sessionLink.classList.add('inline-flex');
    } else {
      guest.classList.remove('hidden');
      sessionLink.classList.add('hidden');
      sessionLink.classList.remove('inline-flex');
    }
  }, [session]);

  return null;
}
