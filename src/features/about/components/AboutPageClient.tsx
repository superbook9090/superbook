'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  GraduationCap,
  Target,
  Sparkles,
  ShieldCheck,
  Users,
  CheckCircle2,
  Mail,
  ArrowRight,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import BackButton from '@/components/ui/BackButton';
import Header from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';
import { useTranslation } from '@/hooks/useTranslation';
import { SITE_NAME } from '@/lib/seo/config';

export default function AboutPageClient() {
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
            label={t('about.backToHome')}
            className="hover:text-[var(--primary)] mb-8"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-12 text-center sm:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-sm font-semibold mb-2">
              <Sparkles className="w-4 h-4" />
              <span>{t('about.badge') || `About ${SITE_NAME}`}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-foreground)]">
              {t('about.title')}
            </h1>
            <p className="text-[var(--color-muted-foreground)] font-medium text-lg max-w-2xl">
              {t('about.subtitle')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--card-solid)] border border-[var(--border)] rounded-3xl p-8 sm:p-12 shadow-2xl space-y-12"
          >
            {/* Mission & Vision */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[var(--primary)] mb-2">
                <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                  {t('about.missionTitle')}
                </h2>
              </div>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                {t('about.missionText1')}
              </p>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                {t('about.missionText2')}
              </p>
            </section>

            {/* What We Offer */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 text-[var(--primary)] mb-2">
                <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                  {t('about.offeringsTitle')}
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--color-background)]/50 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-[var(--color-foreground)]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>{t('about.quizMakerTitle')}</span>
                  </div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    {t('about.quizMakerDesc')}
                  </p>
                </div>
                <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--color-background)]/50 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-[var(--color-foreground)]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>{t('about.aiGeneratorTitle')}</span>
                  </div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    {t('about.aiGeneratorDesc')}
                  </p>
                </div>
                <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--color-background)]/50 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-[var(--color-foreground)]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>{t('about.mockTestsTitle')}</span>
                  </div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    {t('about.mockTestsDesc')}
                  </p>
                </div>
                <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--color-background)]/50 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-[var(--color-foreground)]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span>{t('about.blogsTitle')}</span>
                  </div>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    {t('about.blogsDesc')}
                  </p>
                </div>
              </div>
            </section>

            {/* Editorial Standards & Content Integrity */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[var(--primary)] mb-2">
                <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                  {t('about.standardsTitle')}
                </h2>
              </div>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                {t('about.standardsIntro')}
              </p>
              <ul className="list-disc list-inside space-y-2 text-[var(--color-muted-foreground)] pl-2">
                <li>
                  <strong className="text-[var(--color-foreground)]">
                    {t('about.standardsPoint1')}
                  </strong>
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">
                    {t('about.standardsPoint2')}
                  </strong>
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">
                    {t('about.standardsPoint3')}
                  </strong>
                </li>
                <li>
                  <strong className="text-[var(--color-foreground)]">
                    {t('about.standardsPoint4')}
                  </strong>
                </li>
              </ul>
            </section>

            {/* Who Runs Quiz Do & Transparency */}
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-[var(--primary)] mb-2">
                <div className="p-3 bg-[var(--primary)]/10 rounded-2xl">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--color-foreground)]">
                  {t('about.transparencyTitle')}
                </h2>
              </div>
              <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                {t('about.transparencyText')}
              </p>
              <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--color-background)]/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[var(--primary)]/10 rounded-xl text-[var(--primary)]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--color-foreground)]">
                      {t('about.contactQuestion')}
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      {t('about.contactAnswer')}
                    </p>
                  </div>
                </div>
                <Link
                  href={ROUTES.contact}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  <span>{t('about.contactButton')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>

            {/* Core Legal & Publisher Links */}
            <div className="pt-6 border-t border-[var(--border)] flex flex-wrap gap-4 text-sm text-[var(--color-muted-foreground)]">
              <Link href={ROUTES.privacy} className="hover:text-[var(--primary)] underline underline-offset-4">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href={ROUTES.terms} className="hover:text-[var(--primary)] underline underline-offset-4">
                Terms of Service
              </Link>
              <span>•</span>
              <Link href={ROUTES.blogs} className="hover:text-[var(--primary)] underline underline-offset-4">
                Educational Blogs
              </Link>
              <span>•</span>
              <Link href={ROUTES.toolsIndex} className="hover:text-[var(--primary)] underline underline-offset-4">
                All Free Tools
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
