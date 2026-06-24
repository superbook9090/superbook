'use client';

import { useTranslation } from '@/hooks/useTranslation';
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
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { landing } from '@/components/home/landingStyles';
import Image from 'next/image';
import type { SeoToolData } from '@/data/seo-tools';

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
  tool: SeoToolData;
};

export default function ToolClient({ tool }: ToolClientProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {/* Header bar */}
      <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className={`${landing.container} h-16 flex items-center justify-between`}>
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
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href={ROUTES.login}
              className="text-sm font-medium text-[var(--color-foreground)] hover:text-[var(--student-primary)] transition-colors"
            >
              {t('home.login')}
            </Link>
          </div>
        </div>
      </header>

      <div className={landing.container}>
        <PageWrapper>
          <div className="py-16 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--student-soft)] rounded-full border border-[var(--student-border)] mb-6">
              <Sparkles className="w-4 h-4 text-[var(--student-primary)]" aria-hidden />
              <span className="text-sm font-semibold text-[var(--student-primary)]">
                Quiz-Do Education Tools
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-foreground)] mb-6 leading-tight">
              {tool.h1}
            </h1>
            <p className="text-xl text-[var(--color-muted-foreground)] leading-relaxed">
              {tool.intro}
            </p>
          </div>

          <div className="space-y-16">
            {/* Features */}
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

            {/* How it works */}
            <section className="bg-[var(--card-solid)] border-2 border-[var(--student-border)] rounded-[32px] p-8 sm:p-10 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)]" />
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

            {/* Benefits */}
            <section className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-[var(--color-foreground)] mb-10">
                Why Choose Our Tool
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

            {/* FAQ Accordions */}
            <section className="max-w-3xl mx-auto mt-16">
              <h2 className="text-3xl font-bold text-center text-[var(--color-foreground)] mb-10">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {tool.faqs.map((faq, i) => (
                  <Accordion key={i} title={faq.question}>
                    <p>{faq.answer}</p>
                  </Accordion>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center py-20 px-4 bg-[var(--student-primary)] text-white rounded-[40px] mt-20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--student-primary)] to-[var(--teacher-primary)]" />
              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-6">
                  Ready to get started?
                </h2>
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join thousands of educators and students using Quiz-Do.
                </p>
                <Link
                  href={ROUTES.register}
                  className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-2xl text-[var(--student-primary)] bg-white hover:bg-[var(--student-soft)] transition-colors shadow-xl"
                >
                  {tool.callToAction}
                </Link>
              </div>
            </section>

            {/* Internal Links for Top Authority */}
            <section className="pt-10 border-t border-[var(--border)]">
              <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-4">Explore More Tools</h3>
              <div className="flex flex-wrap gap-3">
                <Link href="/quiz-maker-free" className="text-sm px-4 py-2 bg-[var(--color-surface-muted)] rounded-lg hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors">Free Quiz Maker</Link>
                <Link href="/ai-quiz-generator" className="text-sm px-4 py-2 bg-[var(--color-surface-muted)] rounded-lg hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors">AI Quiz Generator</Link>
                <Link href="/mcq-generator" className="text-sm px-4 py-2 bg-[var(--color-surface-muted)] rounded-lg hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors">MCQ Generator</Link>
                <Link href="/course-maker-free" className="text-sm px-4 py-2 bg-[var(--color-surface-muted)] rounded-lg hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors">Course Maker</Link>
                <Link href="/test-series-maker-free" className="text-sm px-4 py-2 bg-[var(--color-surface-muted)] rounded-lg hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors">Test Series Maker</Link>
                <Link href={ROUTES.blogs} className="text-sm px-4 py-2 bg-[var(--color-surface-muted)] rounded-lg hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors">Educational Blogs</Link>
                <Link href="/courses" className="text-sm px-4 py-2 bg-[var(--color-surface-muted)] rounded-lg hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors">Public Courses</Link>
                <Link href="/tools" className="text-sm px-4 py-2 bg-[var(--color-surface-muted)] rounded-lg hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors">All Tools</Link>
              </div>
            </section>

          </div>
        </PageWrapper>
      </div>
    </div>
  );
}
