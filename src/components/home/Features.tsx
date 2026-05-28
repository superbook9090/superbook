'use client';

import { motion } from 'framer-motion';
import {
  BookOpen,
  ClipboardList,
  Compass,
  KeyRound,
  Newspaper,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { LANDING_CLASSES } from '@/constants/spacing';
import type { SVGProps } from 'react';

type HomeFeatureKey =
  | 'structuredCourses'
  | 'curriculumQuizzes'
  | 'progressInsights'
  | 'browseEnroll'
  | 'privateCourses'
  | 'blogsResources';

const featureKeys: HomeFeatureKey[] = [
  'structuredCourses',
  'curriculumQuizzes',
  'progressInsights',
  'browseEnroll',
  'privateCourses',
  'blogsResources',
];

function FeatureIcon({
  featureKey,
  ...props
}: SVGProps<SVGSVGElement> & { featureKey: HomeFeatureKey }) {
  switch (featureKey) {
    case 'structuredCourses':
      return <BookOpen {...props} />;
    case 'curriculumQuizzes':
      return <ClipboardList {...props} />;
    case 'progressInsights':
      return <TrendingUp {...props} />;
    case 'browseEnroll':
      return <Compass {...props} />;
    case 'privateCourses':
      return <KeyRound {...props} />;
    case 'blogsResources':
      return <Newspaper {...props} />;
    default:
      return <BookOpen {...props} />;
  }
}

export default function Features() {
  const { t } = useTranslation();

  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      className={`${LANDING_CLASSES.sectionDefer} ${LANDING_CLASSES.section} ${LANDING_CLASSES.surface}`}
    >
      <div className={LANDING_CLASSES.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className={LANDING_CLASSES.sectionHeader}
        >
          <h2 id="features-heading" className={LANDING_CLASSES.title}>
            {t('home.features.title')}
          </h2>
          <p className={LANDING_CLASSES.subtitle}>{t('home.features.subtitle')}</p>
        </motion.div>

        <div className={LANDING_CLASSES.featureGrid}>
          {featureKeys.map((featureKey, index) => (
            <motion.div
              key={featureKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className={LANDING_CLASSES.featureCard}
            >
              <div className={LANDING_CLASSES.featureCardIconWrap}>
                <FeatureIcon
                  featureKey={featureKey}
                  className={LANDING_CLASSES.featureCardIcon}
                  aria-hidden
                />
              </div>

              <h3 className={LANDING_CLASSES.featureCardTitle}>
                {t(`home.features.${featureKey}`)}
              </h3>
              <p className={LANDING_CLASSES.featureCardDesc}>
                {t(`home.features.${featureKey}Desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
