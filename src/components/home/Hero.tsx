'use client';

import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import PremiumLogo from '@/components/ui/PremiumLogo';
import { roleThemes } from '@/lib/roleTheme';
import { landing } from '@/components/home/landingStyles';
import { HomeHighlightIcon, type HomeHighlightKey } from '@/components/home/homeIcons';
import { ArrowRight, Sparkles } from 'lucide-react';

const highlightKeys: HomeHighlightKey[] = ['courses', 'quizzes', 'languages'];

export default function Hero() {
  const { t } = useTranslation();
  const theme = roleThemes.student;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} aria-hidden />

      <div
        className="hero-blob absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
        aria-hidden
      />
      <div
        className="hero-blob hero-blob-delayed absolute bottom-20 right-10 w-96 h-96 bg-[var(--student-accent)]/20 rounded-full blur-3xl"
        aria-hidden
      />

      <div className={`relative z-10 ${landing.container} py-20 text-center`}>
        <div className="hero-fade-in inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
          <Sparkles className="w-4 h-4 text-white" aria-hidden />
          <span className="text-sm font-medium text-white">{t('home.badge')}</span>
        </div>

        <div className="hero-fade-in hero-fade-in-delay-1 flex items-center justify-center gap-3 mb-6">
          <PremiumLogo variant="default" size="xl" theme="student" priority />
        </div>

        <h1 className="hero-fade-in hero-fade-in-delay-2 text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-4xl mx-auto">
          {t('home.title')}
        </h1>

        <p className="hero-fade-in hero-fade-in-delay-3 text-xl sm:text-2xl text-white/85 mb-4 max-w-3xl mx-auto">
          {t('home.subtitle')}
        </p>

        <p className="hero-fade-in hero-fade-in-delay-4 text-base sm:text-lg text-white/65 max-w-2xl mx-auto mb-12 leading-relaxed">
          {t('home.description')}
        </p>

        <div className="hero-fade-in hero-fade-in-delay-5 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={ROUTES.register}
            className="group flex items-center gap-2 px-8 py-4 bg-white text-[var(--student-primary)] font-semibold rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {t('home.register')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href={ROUTES.login}
            className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-colors duration-300"
          >
            {t('home.login')}
          </Link>
        </div>

        <div className="hero-fade-in hero-fade-in-delay-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-16 max-w-3xl mx-auto">
          {highlightKeys.map((key) => (
            <div key={key} className={landing.highlightCard}>
              <div className={landing.highlightIconWrap}>
                <HomeHighlightIcon highlightKey={key} className={landing.highlightIcon} aria-hidden />
              </div>
              <div className="text-sm font-semibold text-white">{t(`home.highlights.${key}`)}</div>
              <div className="text-xs text-white/60">{t(`home.highlights.${key}Hint`)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2" aria-hidden>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      </div>
    </section>
  );
}
