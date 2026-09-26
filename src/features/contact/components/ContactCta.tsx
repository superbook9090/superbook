'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { ArrowRight, Sparkles } from 'lucide-react';

export function ContactCta() {
  const { t } = useTranslation();

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden text-center w-full">
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0d1117] to-black z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[var(--primary)]/15 blur-[140px] rounded-full pointer-events-none z-0" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20 blur-[1px]"
            style={{
              width: `${(i % 3) * 3 + 3}px`,
              height: `${(i % 3) * 3 + 3}px`,
              left: `${(i * 17) % 100}%`,
              top: `${(i * 23) % 100}%`,
            }}
            animate={{
              y: [0, -35, 0],
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: (i % 3) * 2 + 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-4 z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-6"
        >
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/10 text-white border border-white/15 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('contact.joinToday')}</span>
          </span>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_25px_rgba(var(--primary-rgb),0.4)]">
            {t('contact.cta.title')}
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-white/75 font-medium max-w-xl mx-auto leading-relaxed">
            {t('contact.cta.subtitle')}
          </p>

          <div className="pt-2">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="inline-block">
              <Link
                href={ROUTES.register}
                className="group relative inline-flex items-center justify-center gap-2.5 px-8 sm:px-10 py-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-widest text-slate-950 bg-white shadow-[0_0_35px_rgba(255,255,255,0.35)] hover:shadow-[0_0_50px_rgba(255,255,255,0.55)] transition-all duration-300 cursor-pointer"
              >
                <span>{t('contact.cta.button')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
