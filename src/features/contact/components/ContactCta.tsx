import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';

export function ContactCta() {
  const { t } = useTranslation();

  return (
    <section className="py-20 text-white relative overflow-hidden bg-gradient-to-br from-slate-900 via-[var(--primary-dark)]/40 to-slate-900 text-center w-full">
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[var(--primary)]/10 blur-[80px]" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[var(--primary-accent)]/10 blur-[80px]" />

      <div className="relative max-w-4xl mx-auto px-4 z-10 flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-4">
          {t('contact.cta.title')}
        </h2>
        <p className="text-sm sm:text-base text-[var(--primary-border)]/90 font-medium max-w-xl mb-8 leading-relaxed">
          {t('contact.cta.subtitle')}
        </p>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Link
            href={ROUTES.register}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-[var(--primary-hover)] bg-white hover:bg-slate-100 hover:shadow-2xl transition-all duration-300 shadow-lg"
          >
            {t('contact.cta.button')}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
