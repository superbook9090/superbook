'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Accordion } from '@/components/ui/Accordion';
import { HelpCircle } from 'lucide-react';

export function ContactFaq() {
  const { t } = useTranslation();

  const faqs = [
    { q: t('contact.faq.q1'), a: t('contact.faq.a1') },
    { q: t('contact.faq.q2'), a: t('contact.faq.a2') },
    { q: t('contact.faq.q3'), a: t('contact.faq.a3') },
    { q: t('contact.faq.q4'), a: t('contact.faq.a4') },
  ];

  return (
    <section className="py-16 sm:py-24 relative z-10 w-full overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[var(--surface-muted)]/20 backdrop-blur-3xl border-y border-[var(--border)]/50" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-[var(--primary)]/6 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5 }}
            className="space-y-3"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t('contact.faq') || 'Frequently Asked Questions'}</span>
            </span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[var(--color-foreground)]">
              {t('contact.faq.title')}
            </h2>
            <p className="text-[var(--color-muted-foreground)] text-sm sm:text-base font-medium max-w-xl mx-auto">
              {t('contact.faq.subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => (
            <Accordion key={idx} index={idx} title={faq.q}>
              <p className="leading-relaxed">{faq.a}</p>
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  );
}
