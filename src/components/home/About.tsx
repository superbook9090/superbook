'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { roleThemes } from '@/lib/roleTheme';
import { landing } from '@/components/home/landingStyles';
import {
  HomeAboutCapabilityIcon,
  type HomeAboutCapabilityKey,
} from '@/components/home/homeIcons';
import { DashboardGlyph } from '@/components/home/marketingGlyphs';
import { SITE_NAME } from '@/lib/seo/config';

const capabilityKeys: HomeAboutCapabilityKey[] = [
  'roleBasedAccess',
  'realtimeAnalytics',
  'multiLanguage',
  'organizedContent',
];

const previewItems = [
  { key: 'previewCourses' as const, fillClass: 'w-[40%]' },
  { key: 'previewQuizzes' as const, fillClass: 'w-[55%]' },
  { key: 'previewProgress' as const, fillClass: 'w-[72%]' },
];

export default function About() {
  const { t } = useTranslation();
  const theme = roleThemes.student;

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className={`${landing.section} relative overflow-hidden`}
    >
      <div className="absolute inset-0 bg-[var(--background)]" />

      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)] rounded-full blur-[120px]"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.08, 0.16, 0.08],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden
      />
      <div
        className="absolute -bottom-24 -left-24 w-80 h-80 bg-[var(--primary-accent)] opacity-[0.08] rounded-full blur-[120px]"
        aria-hidden
      />

      <div className={`relative z-10 ${landing.container}`}>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              id="about-heading"
              className="text-3xl sm:text-4xl font-bold text-[var(--color-foreground)] mb-6"
            >
              {t('home.about.title')}
            </h2>
            <p className="text-lg text-[var(--color-muted-foreground)] mb-8 leading-relaxed">
              {t('home.about.description')}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {capabilityKeys.map((capabilityKey, index) => (
                <motion.div
                  key={capabilityKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className={`w-10 h-10 ${theme.activeBg} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <HomeAboutCapabilityIcon
                      capabilityKey={capabilityKey}
                      className={`w-5 h-5 ${theme.text}`}
                      aria-hidden
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--color-foreground)] mb-1">
                      {t(`home.about.${capabilityKey}`)}
                    </h4>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      {t(`home.about.${capabilityKey}Desc`)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative glass rounded-3xl p-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
                  <div className="w-10 h-10 bg-[var(--primary-soft)] rounded-xl flex items-center justify-center">
                    <DashboardGlyph className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--color-foreground)]">
                      {t('common.dashboard')}
                    </div>
                    <div className="text-xs text-[var(--color-muted)]">{SITE_NAME}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {previewItems.map(({ key, fillClass }) => (
                    <div
                      key={key}
                      className="flex flex-col justify-end rounded-xl bg-[var(--color-surface-muted)] p-3 min-h-[5rem]"
                    >
                      <span className="text-[10px] uppercase tracking-wide text-[var(--color-muted)] mb-1">
                        {t(`home.about.${key}`)}
                      </span>
                      <div className="h-1.5 w-full rounded-full bg-[var(--color-surface-muted-strong)] overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--primary-accent)] ${fillClass}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl bg-[var(--color-surface-muted)] card-body flex flex-col gap-2">
                  <div className="h-2 bg-[var(--color-surface-muted-strong)] rounded-full w-4/5" />
                  <div className="h-2 bg-[var(--color-surface-muted-strong)] rounded-full w-3/5" />
                  <div className="h-2 bg-[var(--color-surface-muted-strong)] rounded-full w-2/3" />
                </div>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-[var(--card-solid)] border border-[var(--border)] rounded-xl px-3 py-2 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[var(--student-soft)] rounded-lg flex items-center justify-center">
                    <DashboardGlyph className="w-4 h-4 text-[var(--student-primary)]" />
                  </div>
                  <div className="text-sm font-semibold text-[var(--color-foreground)]">
                    {t('home.about.previewBadge')}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
