'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { landing } from '@/components/home/landingStyles';
import { HomeFeatureGlyph, type HomeFeatureKey } from '@/components/home/marketingGlyphs';

const featureKeys: HomeFeatureKey[] = [
  'structuredCourses',
  'curriculumQuizzes',
  'progressInsights',
  'browseEnroll',
  'privateCourses',
  'blogsResources',
];

export default function Features() {
  const { t } = useTranslation();

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className={`${landing.section} relative overflow-hidden bg-[var(--card-solid)]`}
    >
      {/* Ambient background blur for spatial atmosphere */}
      <div
        className="absolute top-1/2 -left-48 -translate-y-1/2 w-96 h-96 bg-[var(--student-primary)]/10 rounded-full blur-3xl pointer-events-none antigravity-pulse-glow"
        aria-hidden
      />
      <div
        className="absolute bottom-0 right-0 w-80 h-80 bg-[var(--teacher-accent)]/8 rounded-full blur-3xl pointer-events-none"
        aria-hidden
      />

      <div className={`relative z-10 ${landing.container}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={landing.sectionHeader}
        >
          <h2 id="features-heading" className={landing.title}>
            {t('home.features.title')}
          </h2>
          <p className={landing.subtitle}>{t('home.features.subtitle')}</p>
        </motion.div>

        <div className={`${landing.featureGrid} perspective-1000`}>
          {featureKeys.map((featureKey, index) => (
            <motion.div
              key={featureKey}
              initial={{ opacity: 0, y: 32, rotateX: 10 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className={landing.featureCard}
            >
              <div className={landing.featureIconWrap}>
                <HomeFeatureGlyph featureKey={featureKey} className={landing.featureIcon} />
              </div>

              <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-2">
                {t(`home.features.${featureKey}`)}
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                {t(`home.features.${featureKey}Desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
