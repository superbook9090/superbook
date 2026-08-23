import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

export function ContactHero() {
  const { t } = useTranslation();

  return (
    <section className="relative pt-28 pb-32 sm:pt-36 sm:pb-40 lg:pt-48 lg:pb-48 flex items-center justify-center overflow-hidden">
      {/* Remove hard background, rely on global backdrop. Add a localized glow for emphasis */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[400px] bg-[var(--primary)]/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse mr-2" />
            {t('contact.title')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight mb-8"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-[var(--color-foreground)] via-[var(--color-foreground)] to-[var(--color-muted-foreground)]">
            {t('contact.heroTitle')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg sm:text-xl lg:text-2xl text-[var(--color-muted-foreground)] max-w-2xl mx-auto font-medium leading-relaxed"
        >
          {t('contact.subtitle')}
        </motion.p>
      </div>
    </section>
  );
}
