'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useSeoTool } from '@/hooks/useSeoTool';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  Brain,
  Zap,
  Clock,
  Globe,
  Shield,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { landing } from '@/components/home/landingStyles';
import MarketingHeader from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';
import { useFeature } from '@/contexts/AppSettingsContext';

const IconMap: Record<string, React.ElementType> = {
  Zap,
  Brain,
  Clock,
  Globe,
  Shield,
  Sparkles,
  BookOpen,
  CheckCircle
};

const EXPLORE_LINKS = [
  { slug: 'quiz', path: '/quiz' },
  { slug: 'quizzes', path: '/quizzes' },
  { slug: 'mock-test-maker', path: '/mock-test-maker' },
  { slug: 'question-paper-maker', path: '/question-paper-maker' },
  { slug: 'ai-course-maker', path: '/ai-course-maker' },
  { slug: 'quiz-generator-from-pdf', path: '/quiz-generator-from-pdf' },
  { slug: 'quiz-maker-free', path: '/quiz-maker-free' },
  { slug: 'ai-quiz-maker-free', path: '/ai-quiz-generator' },
  { slug: 'mcq-generator-free', path: '/mcq-generator' },
  { slug: 'course-maker-free', path: '/course-maker-free' },
  { slug: 'test-series-maker-free', path: '/test-series-maker-free' },
] as const;

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[var(--border)] rounded-2xl bg-[var(--color-surface-muted)] overflow-hidden mb-4 hover:bg-[var(--card-solid)] hover:shadow-md transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--student-primary)]"
      >
        <h3 className="text-lg font-semibold text-[var(--color-foreground)]">{title}</h3>
        <ChevronDown
          className={`w-5 h-5 text-[var(--color-muted-foreground)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-5 pt-0 text-[var(--color-muted-foreground)] border-t border-[var(--border)] mt-4 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type ToolClientProps = {
  toolSlug: string;
};

export default function ToolClient({ toolSlug }: ToolClientProps) {
  const { t, lang } = useTranslation();
  const tool = useSeoTool(toolSlug);
  const enableBlogs = useFeature('enableBlogs');
  const enableCourses = useFeature('enableCourses');

  if (!tool) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <MarketingHeader forceScrolled />

      <div className={`${landing.container} flex-1 mt-20 sm:mt-24 pb-20`}>
        <PageWrapper>
          {/* Hero on the aurora canvas */}
          <div className="relative py-16 text-center max-w-3xl mx-auto">
            <div className="aurora-bg" aria-hidden>
              <div className="aurora-blob w-[34rem] h-[34rem] -top-40 -right-52 bg-[var(--primary)] opacity-[0.14]" />
              <div className="aurora-blob w-[26rem] h-[26rem] -bottom-32 -left-48 bg-[var(--primary-accent)] opacity-[0.10]" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--student-soft)] rounded-full border border-[var(--student-border)] mb-6">
                <Sparkles className="w-4 h-4 text-[var(--student-primary)]" aria-hidden />
                <span className="text-sm font-semibold text-[var(--student-primary)]">
                  {t('seoTools.common.badge')}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-foreground)] mb-6 leading-tight">
                {tool.h1}
              </h1>
              <p className="text-xl text-[var(--color-muted-foreground)] leading-relaxed">
                {tool.intro}
              </p>
            </div>
          </div>

          <div className="space-y-16">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tool.features.map((feature, i) => {
                const Icon = IconMap[feature.iconName] || CheckCircle;
                return (
                  <div key={i} className="bg-[var(--card-solid)] border border-[var(--border)] rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-[var(--student-soft)] rounded-2xl flex items-center justify-center mb-6 border border-[var(--student-border)]">
                      <Icon className="w-6 h-6 text-[var(--student-primary)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-3">{feature.title}</h3>
                    <p className="text-[var(--color-muted-foreground)] leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </section>

            <section className="bg-[var(--card-solid)] border border-[var(--color-border)] rounded-[32px] p-6 sm:p-10 shadow-[var(--shadow-sm)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: 'var(--student-gradient)' }} />
              <h2 className="text-3xl font-bold text-[var(--color-foreground)] mb-10 text-center">
                {tool.h2}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {tool.howItWorks.map((step) => (
                  <div key={step.step} className="text-center">
                    <div className="w-16 h-16 mx-auto bg-[var(--student-soft)] rounded-full flex items-center justify-center mb-6 text-2xl font-bold text-[var(--student-primary)] border border-[var(--student-border)]">
                      {step.step}
                    </div>
                    <h4 className="text-lg font-bold text-[var(--color-foreground)] mb-2">{step.title}</h4>
                    <p className="text-[var(--color-muted-foreground)]">{step.description}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-[var(--color-foreground)] mb-10">
                {t('seoTools.common.whyChoose')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tool.benefits.map((benefit, i) => (
                  <div key={i} className="flex gap-4">
                    <CheckCircle className="w-6 h-6 text-[var(--success)] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-lg font-semibold text-[var(--color-foreground)] mb-1">{benefit.title}</h4>
                      <p className="text-[var(--color-muted-foreground)]">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section key={lang} className="max-w-3xl mx-auto mt-16">
              <h2 className="text-3xl font-bold text-center text-[var(--color-foreground)] mb-10">
                {t('seoTools.common.faqTitle')}
              </h2>
              <div className="space-y-4">
                {tool.faqs.map((faq, i) => (
                  <Accordion key={i} title={faq.question}>
                    <p>{faq.answer}</p>
                  </Accordion>
                ))}
              </div>
            </section>

            <section className="hero-banner text-center mt-20">
              <div className="py-10 sm:py-14 px-2">
                <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-foreground)] mb-6">
                  {t('seoTools.common.ctaTitle')}
                </h2>
                <p className="text-lg sm:text-xl text-[var(--color-muted-foreground)] mb-10 max-w-2xl mx-auto leading-relaxed">
                  {t('seoTools.common.ctaSubtitle')}
                </p>
                <Link
                  href={ROUTES.register}
                  className="btn-premium px-10 py-4 text-lg focus-ring"
                >
                  {tool.callToAction}
                </Link>
              </div>
            </section>

            <section className="pt-10 border-t border-[var(--border)]">
              <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4">{t('seoTools.common.exploreMore')}</h3>
              <div className="flex flex-wrap gap-3">
                {EXPLORE_LINKS.filter((link) => link.slug !== toolSlug).map((link) => (
                  <ExploreToolLink key={link.path} toolSlug={link.slug} href={link.path} />
                ))}
                {enableBlogs && (
                  <Link href={ROUTES.blogs} className="text-sm px-4 py-2 bg-[var(--color-surface-muted)] rounded-lg hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors">
                    {t('home.footer.educationalBlogs')}
                  </Link>
                )}
                {enableCourses && (
                  <Link href={ROUTES.courses} className="text-sm px-4 py-2 bg-[var(--color-surface-muted)] rounded-lg hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors">
                    {t('home.footer.publicCourses')}
                  </Link>
                )}
                <Link href={ROUTES.toolsIndex} className="text-sm px-4 py-2 bg-[var(--color-surface-muted)] rounded-lg hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors">
                  {t('home.footer.allTools')}
                </Link>
              </div>
            </section>

          </div>
        </PageWrapper>
      </div>
      <Footer />
    </div>
  );
}

function ExploreToolLink({ toolSlug, href }: { toolSlug: string; href: string }) {
  const tool = useSeoTool(toolSlug);
  if (!tool) return null;

  return (
    <Link
      href={href}
      className="text-sm px-4 py-2 bg-[var(--color-surface-muted)] rounded-lg hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors"
    >
      {tool.h1}
    </Link>
  );
}
