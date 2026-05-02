'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { roleThemes } from '@/lib/roleTheme';
import { Zap, Globe, Shield, Clock } from 'lucide-react';

const getCapabilities = (t: (key: string) => string) => [
  {
    icon: Shield,
    title: t('home.about.roleBasedAccess'),
    description: t('home.about.roleBasedAccessDesc'),
  },
  {
    icon: Zap,
    title: t('home.about.realtimeAnalytics'),
    description: t('home.about.realtimeAnalyticsDesc'),
  },
  {
    icon: Globe,
    title: t('home.about.multiLanguage'),
    description: t('home.about.multiLanguageDesc'),
  },
  {
    icon: Clock,
    title: t('home.about.optimizedPerformance'),
    description: t('home.about.optimizedPerformanceDesc'),
  },
];

export default function About() {
  const { t } = useTranslation();
  const theme = roleThemes.student;

  return (
    <section className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-violet-900" />

      {/* Animated Shapes */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              {t('home.about.title')}
            </h2>
            <p className="text-lg text-white/70 mb-8">
              {t('home.about.description')}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {getCapabilities(t).map((cap, index) => (
                <motion.div
                  key={cap.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className={`w-10 h-10 ${theme.activeBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <cap.icon className={`w-5 h-5 ${theme.text}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{cap.title}</h4>
                    <p className="text-sm text-white/60">{cap.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              {/* Mock Dashboard Preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-white/30 rounded-full w-3/4" />
                    <div className="h-2 bg-white/20 rounded-full w-1/2" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-20 bg-white/10 rounded-xl" />
                  <div className="h-20 bg-white/10 rounded-xl" />
                  <div className="h-20 bg-white/10 rounded-xl" />
                </div>
                <div className="h-32 bg-white/10 rounded-xl" />
              </div>

              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Fast</div>
                    <div className="text-xs text-gray-500">&lt; 100ms</div>
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
