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

        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          {steps.map((step, index) => (
            <motion.div
              key={step.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.12 }}
              className="relative text-center md:text-left"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="mx-auto md:mx-0 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--student-soft)] border border-[var(--student-border)]">
                  <HomeHowItWorksIcon
                    step={step.key}
                    className="h-7 w-7 text-[var(--student-primary)]"
                    aria-hidden
                  />
                </div>
                <div>
                  <span className="inline-block text-xs font-bold uppercase tracking-wider text-[var(--student-primary)] mb-2">
                    {t('home.howItWorks.stepLabel')} {step.number}
                  </span>
                  <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">
                    {t(`home.howItWorks.${step.key}Title`)}
                  </h3>
                  <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                    {t(`home.howItWorks.${step.key}Desc`)}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 ? (
                <div
                  className="hidden md:block absolute top-7 -right-5 lg:-right-8 w-10 lg:w-16 border-t-2 border-dashed border-[var(--student-border)]"
                  aria-hidden
                />
              ) : null}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
