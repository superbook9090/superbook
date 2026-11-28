'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Building2,
  ShieldCheck,
  Palette,
  Link2,
  Users,
  BookOpen,
  Sparkles,
  Trophy,
  FileText,
  BarChart3,
  Bell,
  CheckCircle2,
  ArrowRight,
  Mail,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import BackButton from '@/components/ui/BackButton';
import Header from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';
import { useTranslation } from '@/hooks/useTranslation';
import { OrganizationRequestForm } from './OrganizationRequestForm';

const FEATURE_ITEMS = [
  { icon: ShieldCheck, titleKey: 'orgLanding.f1Title', descKey: 'orgLanding.f1Desc' },
  { icon: Palette, titleKey: 'orgLanding.f2Title', descKey: 'orgLanding.f2Desc' },
  { icon: Link2, titleKey: 'orgLanding.f3Title', descKey: 'orgLanding.f3Desc' },
  { icon: Users, titleKey: 'orgLanding.f4Title', descKey: 'orgLanding.f4Desc' },
  { icon: BookOpen, titleKey: 'orgLanding.f5Title', descKey: 'orgLanding.f5Desc' },
  { icon: Sparkles, titleKey: 'orgLanding.f6Title', descKey: 'orgLanding.f6Desc' },
  { icon: Trophy, titleKey: 'orgLanding.f7Title', descKey: 'orgLanding.f7Desc' },
  { icon: FileText, titleKey: 'orgLanding.f8Title', descKey: 'orgLanding.f8Desc' },
  { icon: BarChart3, titleKey: 'orgLanding.f9Title', descKey: 'orgLanding.f9Desc' },
  { icon: Bell, titleKey: 'orgLanding.f10Title', descKey: 'orgLanding.f10Desc' },
] as const;

const TRUST_HIGHLIGHTS = [
  'orgLanding.trustIsolated',
  'orgLanding.trustInvites',
  'orgLanding.trustBranding',
  'orgLanding.trustBilingual',
] as const;

const ONBOARDING_STEPS = [
  { num: '01', titleKey: 'orgLanding.step1Title', descKey: 'orgLanding.step1Desc' },
  { num: '02', titleKey: 'orgLanding.step2Title', descKey: 'orgLanding.step2Desc' },
  { num: '03', titleKey: 'orgLanding.step3Title', descKey: 'orgLanding.step3Desc' },
] as const;

export default function OrganizationsLandingClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans flex flex-col selection:bg-[var(--primary)] selection:text-white">
      <Header />

      <main id="main-content" className="flex-1 pt-24 sm:pt-32 pb-16 sm:pb-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-[var(--primary)]/8 rounded-full blur-[110px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[480px] h-[480px] bg-[var(--teacher-primary)]/8 rounded-full blur-[110px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-14 sm:space-y-20">
          <div>
            <BackButton
              href={ROUTES.home}
              label={t('orgLanding.backToHome')}
              className="hover:text-[var(--primary)] mb-6"
            />

            {/* Hero */}
            <motion.section
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs sm:text-sm font-semibold">
                <Building2 className="w-4 h-4 shrink-0" />
                <span>{t('orgLanding.badge')}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[var(--color-foreground)] max-w-4xl leading-[1.1]">
                {t('orgLanding.title')}
              </h1>

              <p className="text-base sm:text-lg text-[var(--color-muted-foreground)] max-w-3xl leading-relaxed">
                {t('orgLanding.subtitle')}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href="#request-organization"
                  className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 rounded-xl gradient-bg text-white font-bold text-sm sm:text-base shadow-md hover:opacity-95 transition-opacity"
                >
                  <span>{t('orgLanding.primaryCta')}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href={ROUTES.contact}
                  className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] font-semibold text-sm sm:text-base hover:bg-[var(--surface-muted)] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[var(--primary)]" />
                  <span>{t('orgLanding.secondaryCta')}</span>
                </Link>
              </div>

              {/* Trust Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
                {TRUST_HIGHLIGHTS.map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-2.5 rounded-2xl border border-[var(--border)] bg-[var(--card-solid)]/90 px-4 py-3 text-xs sm:text-sm font-semibold text-[var(--color-foreground)]"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{t(key)}</span>
                  </div>
                ))}
              </div>
            </motion.section>
          </div>

          {/* All Organization Features */}
          <section className="space-y-6">
            <div className="space-y-2 max-w-3xl">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-foreground)]">
                {t('orgLanding.featuresHeading')}
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">
                {t('orgLanding.featuresSubheading')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {FEATURE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.titleKey}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-5 sm:p-6 flex items-start gap-4 hover:border-[var(--primary)]/40 transition-colors shadow-xs"
                  >
                    <div className="p-2.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <h3 className="text-base font-bold text-[var(--color-foreground)]">
                        {t(item.titleKey)}
                      </h3>
                      <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                        {t(item.descKey)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3-Step Onboarding */}
          <section className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-foreground)]">
              {t('orgLanding.stepsHeading')}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {ONBOARDING_STEPS.map((step) => (
                <div
                  key={step.num}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] p-5 sm:p-6 space-y-2.5"
                >
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] font-mono text-xs font-extrabold">
                    {step.num}
                  </span>
                  <h3 className="text-base font-bold text-[var(--color-foreground)]">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                    {t(step.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact / Request Form */}
          <OrganizationRequestForm />
        </div>
      </main>

      <Footer />
    </div>
  );
}
