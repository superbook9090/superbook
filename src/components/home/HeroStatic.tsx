import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import BrandLogo from '@/components/ui/BrandLogo';
import { Sparkles, ArrowRight } from 'lucide-react';
import { translate } from '@/i18n';
import { landing } from '@/components/home/landingStyles';
import {
  HomeHighlightGlyph,
  type HomeHighlightKey,
} from '@/components/home/marketingGlyphs';

const highlightKeys: HomeHighlightKey[] = ['courses', 'quizzes', 'languages'];

export default function HeroStatic() {
  const t = (key: Parameters<typeof translate>[1]) => translate('en', key);

  const title = t('home.title');
  const [titleLead, titleAccent] = title.includes(' — ')
    ? [title.slice(0, title.indexOf(' — ')), title.slice(title.indexOf(' — ') + 3)]
    : [title, null];

  return (
    <section
      id="hero-static"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--background)]"
    >
      <div className="aurora-bg" aria-hidden>
        <div className="grid-lines absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000,transparent)]" />
        <div className="aurora-blob -top-40 -left-40 size-[38rem] bg-[var(--primary)] opacity-[0.18]" />
        <div className="aurora-blob -top-20 -right-40 size-[34rem] bg-[var(--primary-accent)] opacity-[0.14] [animation-delay:-5s]" />
        <div className="aurora-blob -bottom-40 left-1/3 size-[30rem] bg-[var(--primary)] opacity-[0.1] [animation-delay:-9s]" />
      </div>

      <div className={`relative z-10 ${landing.container} py-20 text-center`}>
        <div className="hero-lcp inline-flex items-center gap-2 px-4 py-2 glass rounded-full mb-8">
          <Sparkles className="w-4 h-4 text-[var(--student-primary)]" aria-hidden />
          <span className="text-sm font-medium text-[var(--muted)]" data-i18n-key="home.badge">
            {t('home.badge')}
          </span>
        </div>

        <div className="hero-lcp flex items-center justify-center mb-6">
          <BrandLogo size="xl" className="text-[var(--color-foreground)]" />
        </div>

        <h1
          className="hero-lcp text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] leading-tight mb-6 max-w-4xl mx-auto"
          data-i18n-key="home.title"
          data-i18n-gradient
        >
          {titleAccent ? (
            <>
              {titleLead} — <span className="gradient-text">{titleAccent}</span>
            </>
          ) : (
            title
          )}
        </h1>

        <p
          className="hero-lcp text-xl sm:text-2xl text-[var(--muted)] mb-4 max-w-3xl mx-auto"
          data-i18n-key="home.subtitle"
        >
          {t('home.subtitle')}
        </p>

        <p
          className="hero-fade-in hero-fade-in-delay-4 text-base sm:text-lg text-[var(--muted-light)] max-w-2xl mx-auto mb-10 leading-relaxed"
          data-i18n-key="home.description"
        >
          {t('home.description')}
        </p>

        <div className="hero-fade-in hero-fade-in-delay-5 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={ROUTES.register}
            className="group flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)] text-white font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <span data-i18n-key="home.register">{t('home.register')}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/quiz-maker-free"
            className="flex items-center gap-2 px-8 py-4 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] backdrop-blur-sm text-[var(--foreground)] font-semibold hover:bg-[var(--color-surface-muted)] transition-colors duration-300"
          >
            Free Quiz Maker
          </Link>
          <Link
            href={ROUTES.login}
            className="flex items-center gap-2 px-8 py-4 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] backdrop-blur-sm text-[var(--foreground)] font-semibold hover:bg-[var(--color-surface-muted)] transition-colors duration-300"
            data-i18n-key="home.login"
          >
            {t('home.login')}
          </Link>
        </div>

        <div className="hero-fade-in hero-fade-in-delay-6 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-16 max-w-3xl mx-auto">
          {highlightKeys.map((key) => (
            <div key={key} className={landing.highlightCard}>
              <div className={landing.highlightIconWrap}>
                <HomeHighlightGlyph highlightKey={key} className={landing.highlightIcon} />
              </div>
              <div
                className="text-sm font-semibold text-[var(--foreground)]"
                data-i18n-key={`home.highlights.${key}`}
              >
                {t(`home.highlights.${key}`)}
              </div>
              <div className="text-xs text-[var(--muted)]" data-i18n-key={`home.highlights.${key}Hint`}>
                {t(`home.highlights.${key}Hint`)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2" aria-hidden>
        <div className="w-6 h-10 border-2 border-[var(--foreground)]/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-[var(--foreground)] rounded-full" />
        </div>
      </div>
    </section>
  );
}
