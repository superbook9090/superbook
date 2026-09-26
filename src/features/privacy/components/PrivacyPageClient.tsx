'use client';
import { ROUTES } from '@/constants/routes';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, Cookie } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import Header from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';
import { useTranslation } from '@/hooks/useTranslation';

export default function PrivacyPageClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans flex flex-col selection:bg-[var(--primary)] selection:text-white">
      <Header />
      
      <main className="flex-1 pt-24 sm:pt-32 pb-16 sm:pb-24 relative overflow-hidden">
        {/* Background Decorative Elements matching global theme */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--primary)]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--color-secondary)]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <BackButton
            href={ROUTES.home}
            label={t('privacy.backToHome')}
            className="hover:text-[var(--primary)] mb-8"
          />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-12 text-center sm:text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-foreground)]">
              {t('privacy.title')}
            </h1>
            <p className="text-[var(--color-muted-foreground)] font-medium text-lg">
              {t('privacy.lastUpdated')}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--card-solid)] border border-[var(--border)] rounded-3xl p-8 sm:p-12 shadow-2xl space-y-12"
          >
            <p className="text-lg text-[var(--color-foreground)] leading-relaxed font-medium">
              {t('privacy.intro')}
            </p>

            <div className="space-y-12">
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--primary)] mb-4">
                  <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
                    <Database className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('privacy.dataCollection')}
                  </h2>
                </div>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16">
                  {t('privacy.dataCollectionText')}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--color-info)] mb-4">
                  <div className="p-3 bg-[var(--color-info-light)] rounded-2xl">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('privacy.dataUse')}
                  </h2>
                </div>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16">
                  {t('privacy.dataUseText')}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--color-warning)] mb-4">
                  <div className="p-3 bg-[var(--color-warning-light)] rounded-2xl">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('privacy.dataSharing')}
                  </h2>
                </div>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16">
                  {t('privacy.dataSharingText')}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--color-success)] mb-4">
                  <div className="p-3 bg-[var(--color-success-light)] rounded-2xl">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('privacy.security')}
                  </h2>
                </div>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16">
                  {t('privacy.securityText')}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--primary)] mb-4">
                  <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
                    <Cookie className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('privacy.cookiesAndAds')}
                  </h2>
                </div>
                <div className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16 space-y-3">
                  <p>
                    {t('privacy.cookiesAndAdsText')}
                  </p>
                  <p>
                    Users may opt out of personalized advertising by visiting{' '}
                    <a
                      href="https://adssettings.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-primary)] underline font-medium"
                    >
                      Google Ads Settings
                    </a>{' '}
                    or by visiting{' '}
                    <a
                      href="https://www.aboutads.info/choices/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-primary)] underline font-medium"
                    >
                      www.aboutads.info
                    </a>
                    .
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-12 pt-12 border-t border-[var(--border)] text-center">
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-4">
                {t('privacy.contactUs')}
              </h3>
              <p className="text-[var(--color-muted-foreground)] mb-6">
                {t('privacy.contactUsText')}
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
