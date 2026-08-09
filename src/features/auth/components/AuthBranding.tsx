'use client';

import { motion } from 'framer-motion';
import PremiumLogo from '@/components/ui/PremiumLogo';
import { useTranslation } from '@/hooks/useTranslation';
import { roleThemes } from '@/lib/roleTheme';

export default function AuthBranding() {
  const { t } = useTranslation();
  const theme = roleThemes.student;

  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
      
      {/* Animated Shapes */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--student-accent)]/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <PremiumLogo 
              variant="default"
              size="lg"
              mono
            />
          </motion.div>

          <h2 className="text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
            {t('login.learnSmarter')}
            <br />
            <span className="text-white/80">{t('login.growFaster')}</span>
          </h2>

          <p className="text-xl text-white/70 max-w-md mb-12">
            {t('login.joinThousands')}
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            {[t('login.interactiveCourses'), t('login.liveQuizzes'), t('login.progressTracking')].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white text-sm font-medium"
              >
                {feature}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
