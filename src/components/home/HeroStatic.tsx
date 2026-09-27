import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { Sparkles, ArrowRight, Trophy, Flame, Timer } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/card';
import { translate } from '@/i18n';
import { landing } from '@/components/home/landingStyles';
import HeroSpatialDeck from '@/components/home/HeroSpatialDeck';

export default function HeroStatic() {
  const t = (key: Parameters<typeof translate>[1]) => translate('en', key);

  const title = t('home.title');
  const [titleLead, titleAccent] = title.includes(' — ')
    ? [title.slice(0, title.indexOf(' — ')), title.slice(title.indexOf(' — ') + 3)]
    : [title, null];

  return (
    <section
      id="hero-static"
      className="relative min-h-[100svh] flex flex-col justify-center overflow-hidden bg-[var(--background)] pt-20 sm:pt-32 pb-10 sm:pb-16"
    >
      <div className="aurora-bg" aria-hidden>
        <div className="grid-lines absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000,transparent)]" />
        <div className="aurora-blob -top-40 -left-40 size-[38rem] bg-[var(--primary)] opacity-[0.18]" />
        <div className="aurora-blob -top-20 -right-40 size-[34rem] bg-[var(--primary-accent)] opacity-[0.14] [animation-delay:-5s]" />
        <div className="aurora-blob -bottom-40 left-1/3 size-[30rem] bg-[var(--primary)] opacity-[0.1] [animation-delay:-9s]" />
      </div>

      <div className={`relative z-10 w-full px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center text-center`}>
        <Badge variant="secondary" className="hero-lcp glass rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-6 sm:mb-8 gap-2 border-none flex-wrap justify-center text-center h-auto max-w-[95%] sm:max-w-none mx-auto whitespace-normal">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--student-primary)] shrink-0" aria-hidden />
          <span className="text-xs sm:text-sm font-medium text-[var(--muted)] break-words" data-i18n-key="home.badge">
            {t('home.badge')}
          </span>
        </Badge>

        <h1
          className="hero-lcp text-3xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] leading-tight mb-4 sm:mb-6 max-w-4xl mx-auto break-words"
          data-i18n-key="home.title"
          data-i18n-gradient
        >
          {titleAccent ? (
            <>
              {titleLead} — <span className="gradient-text block mt-1 sm:inline sm:mt-0">{titleAccent}</span>
            </>
          ) : (
            title
          )}
        </h1>

        <p
          className="hero-lcp text-base sm:text-2xl text-[var(--muted)] mb-3 sm:mb-4 max-w-3xl mx-auto px-2"
          data-i18n-key="home.subtitle"
        >
          {t('home.subtitle')}
        </p>

        <p
          className="hero-fade-in hero-fade-in-delay-4 text-sm sm:text-lg text-[var(--muted-light)] max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed px-2"
          data-i18n-key="home.description"
        >
          {t('home.description')}
        </p>

        <div className="hero-fade-in hero-fade-in-delay-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full max-w-sm sm:max-w-none mx-auto px-2 sm:px-4">
          <Button asChild size="lg" className="rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group w-full sm:w-auto bg-[var(--student-primary)] hover:bg-[var(--student-accent)] text-white border-none h-12 sm:h-11">
            <Link href={ROUTES.register}>
              <span data-i18n-key="home.register">{t('home.register')}</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full antigravity-glass text-[var(--foreground)] font-semibold hover:border-[var(--primary)]/50 transition-colors duration-300 w-full sm:w-auto h-12 sm:h-11">
            <Link href="/quiz-maker-free">
              Free Quiz Maker
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full antigravity-glass text-[var(--foreground)] font-semibold hover:border-[var(--primary)]/50 transition-colors duration-300 w-full sm:w-auto h-12 sm:h-11">
            <Link href={ROUTES.login} data-i18n-key="home.login">
              {t('home.login')}
            </Link>
          </Button>
        </div>

        {/* 3D Antigravity Floating Spatial Deck */}
        <HeroSpatialDeck />

        <div className="hero-fade-in hero-fade-in-delay-6 flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-6 mt-4 sm:mt-8 max-w-3xl mx-auto w-full px-2 sm:px-0">
          {/* Custom Gamification Highlights */}
          <Card className={`${landing.highlightCard} antigravity-card border border-[var(--border)]/50 bg-background/50 flex flex-col items-center justify-center text-center p-4 sm:p-6 backdrop-blur-md`}>
            <div className={`${landing.highlightIconWrap} mb-2 sm:mb-3 bg-indigo-500/10 p-2 sm:p-3 rounded-full`}>
              <Trophy className="w-5 h-5 sm:w-6 h-6 text-indigo-500" />
            </div>
            <div className="text-sm font-bold text-[var(--foreground)] mb-1">
              Live Leaderboards
            </div>
            <div className="text-xs text-[var(--muted)] leading-tight">
              Compete globally and climb the ranks
            </div>
          </Card>
          
          <Card className={`${landing.highlightCard} antigravity-card border border-[var(--border)]/50 bg-background/50 flex flex-col items-center justify-center text-center p-4 sm:p-6 backdrop-blur-md`}>
            <div className={`${landing.highlightIconWrap} mb-2 sm:mb-3 bg-rose-500/10 p-2 sm:p-3 rounded-full`}>
              <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500" />
            </div>
            <div className="text-sm font-bold text-[var(--foreground)] mb-1">
              Daily Streaks
            </div>
            <div className="text-xs text-[var(--muted)] leading-tight">
              Build habits and earn unique badges
            </div>
          </Card>

          <Card className={`${landing.highlightCard} antigravity-card border border-[var(--border)]/50 bg-background/50 hidden sm:flex flex-col items-center justify-center text-center p-6 backdrop-blur-md`}>
            <div className={`${landing.highlightIconWrap} mb-3 bg-emerald-500/10 p-3 rounded-full`}>
              <Timer className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="text-sm font-bold text-[var(--foreground)] mb-1">
              Timed Mock Tests
            </div>
            <div className="text-xs text-[var(--muted)] leading-tight">
              Experience real exam pressure
            </div>
          </Card>
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
