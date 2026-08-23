import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { Accordion } from '@/components/ui/Accordion';

export function ContactFaq() {
  const { t } = useTranslation();

  const faqs = [
    { q: t('contact.faq.q1'), a: t('contact.faq.a1') },
    { q: t('contact.faq.q2'), a: t('contact.faq.a2') },
    { q: t('contact.faq.q3'), a: t('contact.faq.a3') },
    { q: t('contact.faq.q4'), a: t('contact.faq.a4') },
  ];

  return (
    <section className="py-24 sm:py-32 relative z-10 w-full overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[var(--surface-muted)]/30 backdrop-blur-3xl border-y border-white/10 dark:border-white/5" />
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[var(--primary)]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-[var(--color-foreground)] mb-4">
              {t('contact.faq.title')}
            </h2>
            <p className="text-[var(--color-muted-foreground)] text-base sm:text-lg font-medium max-w-xl mx-auto">
              {t('contact.faq.subtitle')}
            </p>
          </motion.div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Accordion key={idx} index={idx} title={faq.q}>
              <p>{faq.a}</p>
            </Accordion>
          ))}
        </div>
      </div>
    </section>
  );
}
