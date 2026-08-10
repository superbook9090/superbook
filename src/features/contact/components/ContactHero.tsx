import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';

export function ContactHero() {
  const { t } = useTranslation();

  return (
    <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-36 bg-gradient-to-br from-slate-900 via-[var(--primary-dark)]/40 to-slate-900 text-white flex items-center justify-center overflow-hidden">
      {/* Subtle decorative floating circle lights */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[var(--primary)]/10 blur-[80px]" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[var(--primary-accent)]/10 blur-[100px]" />

      {/* Particle Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-25" />

      <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: -25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--primary)]/15 border border-[var(--primary-border)]/20 text-[var(--primary-accent)] mb-6">
            {t('contact.title')}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="heading-xl tracking-tight text-white mb-6 lg:text-5xl"
        >
          {t('contact.heroTitle')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed"
        >
          {t('contact.subtitle')}
        </motion.p>
      </div>
    </section>
  );
}
