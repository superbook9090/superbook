'use client';
import { ROUTES } from '@/constants/routes';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Lock, Eye, Database } from 'lucide-react';
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
            label={t('privacy.backToHome') || 'Back to Home'}
            className="hover:text-[var(--primary)] mb-8"
          />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-12 text-center sm:text-left"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-foreground)]">
              {t('privacy.title') || 'Privacy Policy'}
            </h1>
            <p className="text-[var(--color-muted-foreground)] font-medium text-lg">
              {t('privacy.lastUpdated') || 'Last Updated: May 18, 2026'}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--card-solid)] border border-[var(--border)] rounded-3xl p-8 sm:p-12 shadow-2xl space-y-12"
          >
            <p className="text-lg text-[var(--color-foreground)] leading-relaxed font-medium">
              {t('privacy.intro') || 'Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.'}
            </p>

            <div className="space-y-12">
              <section className="space-y-4">
                <div className="flex items-center gap-3 text-[var(--primary)] mb-4">
                  <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
                    <Database className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('privacy.dataCollection') || 'Information We Collect'}
                  </h2>
                </div>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16">
                  {t('privacy.dataCollectionText') || 'We collect information you provide directly to us when you create an account, update your profile, use the interactive features of our services, participate in quizzes or courses, request customer support, or otherwise communicate with us.'}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-blue-500 mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl">
                    <Eye className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('privacy.dataUse') || 'How We Use Your Information'}
                  </h2>
                </div>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16">
                  {t('privacy.dataUseText') || 'We use the information we collect to provide, maintain, and improve our services, to develop new features, and to protect Quiz-Do and our users.'}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-orange-500 mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-2xl">
                    <Shield className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('privacy.dataSharing') || 'Information Sharing'}
                  </h2>
                </div>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16">
                  {t('privacy.dataSharingText') || 'We do not share your personal information with third parties except as described in this privacy policy or as required by law.'}
                </p>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3 text-emerald-500 mb-4">
                  <div className="p-3 bg-emerald-500/10 rounded-2xl">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                    {t('privacy.security') || 'Security'}
                  </h2>
                </div>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed pl-2 sm:pl-16">
                  {t('privacy.securityText') || 'We take reasonable measures to help protect information about you from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction.'}
                </p>
              </section>
            </div>

            <div className="mt-12 pt-12 border-t border-[var(--border)] text-center">
              <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-4">
                {t('privacy.contactUs') || 'Contact Us'}
              </h3>
              <p className="text-[var(--color-muted-foreground)] mb-6">
                {t('privacy.contactUsText') || 'If you have any questions about this Privacy Policy, please contact us.'}
              </p>
              <Link 
                href={ROUTES.contact} 
                className="inline-flex items-center justify-center px-8 py-3.5 bg-[var(--primary)] text-white font-bold rounded-2xl shadow-lg shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-[var(--primary)]/30 transition-all duration-200"
              >
                {t('privacy.contactUs') || 'Contact Us'}
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
