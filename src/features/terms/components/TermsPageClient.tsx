'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, BookOpen, UserCheck, AlertCircle, FileText, ExternalLink } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import BackButton from '@/components/ui/BackButton';
import Header from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';
import { useTranslation } from '@/hooks/useTranslation';

export default function TermsPageClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans flex flex-col selection:bg-[var(--primary)] selection:text-white">
      <Header />

      <main className="flex-1 pt-24 sm:pt-32 pb-16 sm:pb-24 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-secondary)]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <BackButton
            href={ROUTES.home}
            label={t('terms.backToHome')}
            className="hover:text-[var(--primary)] mb-8"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-12 text-center sm:text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-foreground)]">
              {t('terms.title')}
            </h1>
            <p className="text-[var(--color-muted-foreground)] font-medium text-lg">
              {t('terms.lastUpdated')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--card-solid)] border border-[var(--border)] rounded-3xl p-8 sm:p-12 shadow-2xl space-y-12"
          >
            <p className="text-lg text-[var(--color-foreground)] leading-relaxed font-medium">
              {t('terms.intro')}
            </p>

            <div className="space-y-12">
              {/* Acceptance of Terms */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--primary)] mb-4">
                  <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('terms.acceptance')}
                  </h2>
                </div>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16">
                  {t('terms.acceptanceText')}
                </p>
              </section>

              {/* User Accounts */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--color-info)] mb-4">
                  <div className="p-3 bg-[var(--color-info-light)] rounded-2xl">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('terms.accounts')}
                  </h2>
                </div>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16">
                  {t('terms.accountsText')}
                </p>
              </section>

              {/* Conduct */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--color-warning)] mb-4">
                  <div className="p-3 bg-[var(--color-warning-light)] rounded-2xl">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('terms.conduct')}
                  </h2>
                </div>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16">
                  {t('terms.conductText')}
                </p>
              </section>

              {/* Content & Intellectual Property */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--color-success)] mb-4">
                  <div className="p-3 bg-[var(--color-success-light)] rounded-2xl">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('terms.content')}
                  </h2>
                </div>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16">
                  {t('terms.contentText')}
                </p>
              </section>

              {/* Third-Party Advertising & AdSense */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--primary)] mb-4">
                  <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
                    <ExternalLink className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('terms.advertising')}
                  </h2>
                </div>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16">
                  {t('terms.advertisingText')}
                </p>
              </section>

              {/* Disclaimer */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--color-error)] mb-4">
                  <div className="p-3 bg-[var(--color-error-light)] rounded-2xl">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('terms.disclaimer')}
                  </h2>
                </div>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16">
                  {t('terms.disclaimerText')}
                </p>
              </section>
            </div>

            <div className="mt-12 pt-12 border-t border-[var(--border)] text-center">
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-4">
                {t('terms.contactUs')}
              </h3>
              <p className="text-[var(--color-muted-foreground)] mb-6">
                {t('terms.contactUsText')}
              </p>
              <Link
                href={ROUTES.contact}
                className="inline-flex items-center justify-center px-8 py-3.5 bg-[var(--primary)] text-white font-bold rounded-2xl shadow-lg shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-[var(--primary)]/30 transition-all duration-200"
              >
                {t('privacy.contactUs')}
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
