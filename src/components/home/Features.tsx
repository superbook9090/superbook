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
      className={`${landing.section} bg-[var(--card-solid)]`}
    >
      <div className={landing.container}>
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

        <div className={landing.featureGrid}>
          {featureKeys.map((featureKey, index) => (
            <motion.div
              key={featureKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={landing.featureCard}
            >
              <div className={landing.featureIconWrap}>
                <HomeFeatureGlyph featureKey={featureKey} className={landing.featureIcon} />
              </div>

              <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
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
