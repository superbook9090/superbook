'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { BookOpen, Brain, FileText, BarChart3 } from 'lucide-react';

const getFeatures = (t: (key: string) => string) => [
  {
    icon: BookOpen,
    title: t('home.features.coursesManagement'),
    description: t('home.features.coursesDesc'),
  },
  {
    icon: Brain,
    title: t('home.features.quizSystem'),
    description: t('home.features.quizDesc'),
  },
  {
    icon: FileText,
    title: t('home.features.blogPlatform'),
    description: t('home.features.blogDesc'),
  },
  {
    icon: BarChart3,
    title: t('home.features.analyticsDashboard'),
    description: t('home.features.analyticsDesc'),
  },
];

export default function Features() {
  const { t } = useTranslation();

  return (
    <section className="py-20 sm:py-32 bg-[var(--card-solid)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-foreground)] mb-4">
            {t('home.features.title')}
          </h2>
          <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto">
            {t('home.features.subtitle')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {getFeatures(t).map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-6 bg-[var(--color-surface-muted)] rounded-2xl hover:bg-[var(--card-solid)] hover:shadow-xl transition-all duration-300 border border-[var(--color-border)]"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-[var(--color-accent)] rounded-xl flex items-center justify-center mb-4 group-hover:bg-[var(--color-primary)] transition-colors duration-300">
                <feature.icon className="w-6 h-6 text-[var(--color-primary)] group-hover:text-white transition-colors duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
