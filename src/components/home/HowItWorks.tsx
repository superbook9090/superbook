'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { LANDING_CLASSES } from '@/constants/spacing';
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
      className={`${LANDING_CLASSES.sectionDefer} ${LANDING_CLASSES.section} bg-[var(--background)] border-y border-[var(--border)]`}
    >
      <div className={LANDING_CLASSES.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={LANDING_CLASSES.sectionHeader}
        >
          <h2 id="how-it-works-heading" className={LANDING_CLASSES.title}>
            {t('home.howItWorks.title')}
          </h2>
          <p className={LANDING_CLASSES.subtitle}>{t('home.howItWorks.subtitle')}</p>
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
                <div className={`mx-auto md:mx-0 ${LANDING_CLASSES.stepIconWrap}`}>
                  <HomeHowItWorksIcon
                    step={step.key}
                    className={LANDING_CLASSES.stepIcon}
                    aria-hidden
                  />
                </div>
                <div>
                  <span className={LANDING_CLASSES.stepLabel}>
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
