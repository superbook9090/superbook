import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';

export function ContactCta() {
  const { t } = useTranslation();

  return (
    <section className="py-24 sm:py-32 relative overflow-hidden text-center w-full mt-10">
      {/* Immersive Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#101319] to-black z-0" />
      <div className="absolute inset-0 bg-[var(--primary)]/10 mix-blend-color z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[var(--primary)]/20 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none z-0" />

      {/* Floating particles simulation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/20 blur-[2px]"
            style={{
              width: Math.random() * 8 + 2 + 'px',
              height: Math.random() * 8 + 2 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: Math.random() * 4 + 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-4 z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-6 drop-shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)]">
            {t('contact.cta.title')}
          </h2>
          <p className="text-base sm:text-lg text-white/70 font-medium max-w-xl mx-auto mb-10 leading-relaxed">
            {t('contact.cta.subtitle')}
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link
              href={ROUTES.register}
              className="group relative inline-flex items-center justify-center px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest text-[var(--primary-dark)] bg-white overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white via-[var(--primary-light)] to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center gap-2 group-hover:text-[var(--primary-dark)] transition-colors">
                {t('contact.cta.button')}
                <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
