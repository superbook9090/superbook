'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Sparkles } from 'lucide-react';

export function ContactHero() {
  const { t } = useTranslation();

  return (
    <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-28 lg:pb-32 flex items-center justify-center overflow-hidden">
      {/* Dynamic Aurora Mesh Glows */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[650px] h-[350px] bg-[var(--primary)]/15 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute top-10 right-1/4 w-[400px] h-[250px] bg-[var(--primary-accent)]/12 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center z-10 space-y-4 sm:space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-[var(--primary)] shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-ping mr-0.5" />
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('contact.title')}</span>
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-[var(--color-foreground)] via-[var(--color-foreground)] to-[var(--color-muted-foreground)] drop-shadow-xs">
            {t('contact.heroTitle')}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-base sm:text-lg lg:text-xl text-[var(--color-muted-foreground)] max-w-2xl mx-auto font-medium leading-relaxed"
        >
          {t('contact.subtitle')}
        </motion.p>
      </div>
    </section>
  );
}
