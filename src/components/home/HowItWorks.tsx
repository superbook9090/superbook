'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { landing } from '@/components/home/landingStyles';
import { HomeHowItWorksIcon, type HomeHowItWorksStep } from '@/components/home/homeIcons';

const steps: { key: HomeHowItWorksStep; number: string }[] = [
  { key: 'step1', number: '1' },
  { key: 'step2', number: '2' },
  { key: 'step3', number: '3' },
];

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className={`${landing.section} bg-[var(--background)] border-y border-[var(--border)]`}
    >
      <div className={landing.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={landing.sectionHeader}
        >
          <h2 id="how-it-works-heading" className={landing.title}>
            {t('home.howItWorks.title')}
          </h2>
          <p className={landing.subtitle}>{t('home.howItWorks.subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 perspective-1000">
          {steps.map((step, index) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 30, rotateX: 6 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="relative text-center md:text-left antigravity-glass antigravity-card p-6 sm:p-7 rounded-3xl border border-[var(--border)] hover:border-[var(--student-primary)]/40 h-full flex flex-col justify-between"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="mx-auto md:mx-0 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--student-soft)] to-[var(--student-primary)]/15 border border-[var(--student-border)] shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <HomeHowItWorksIcon
                    step={step.key}
                    className="h-7 w-7 text-[var(--student-primary)]"
                    aria-hidden
                  />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--student-soft)] text-[var(--student-primary)] text-xs font-bold uppercase tracking-wider mb-2 border border-[var(--student-border)]/50">
                    <span>{t('home.howItWorks.stepLabel')}</span>
                    <span>{step.number}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-2">
                    {t(`home.howItWorks.${step.key}Title`)}
                  </h3>
                  <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                    {t(`home.howItWorks.${step.key}Desc`)}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className="hidden md:block absolute -right-3 lg:-right-4 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-[var(--surface)] border border-[var(--border)] shadow-sm flex items-center justify-center text-[var(--muted)] text-xs font-bold"
                  aria-hidden
                >
                  →
                </div>
              ) : null}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
