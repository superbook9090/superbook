'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PremiumLogo from '@/components/ui/PremiumLogo';
import { useTranslation } from '@/hooks/useTranslation';
import { Heart } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { SITE_NAME } from '@/lib/seo/config';
import { useFeature } from '@/contexts/AppSettingsContext';

const getFooterLinks = (t: (key: string) => string) => ({
  product: [
    { label: t('home.howItWorksPage.title'), href: ROUTES.howItWorks },
    { label: t('home.features.title'), href: '#features' },
    { label: t('home.roles.title'), href: '#roles' },
    { label: t('home.about.title'), href: ROUTES.about },
    { label: t('contact.title'), href: ROUTES.contact },
  ],
  resources: [
    { label: t('home.footer.freeQuizMaker'), href: '/quiz-maker-free' },
    { label: t('home.footer.aiQuizGenerator'), href: '/ai-quiz-generator' },
    { label: t('home.footer.aiQuizGeneratorForTeachers'), href: '/ai-quiz-generator-for-teachers' },
    { label: t('home.footer.mcqGenerator'), href: '/mcq-generator' },
    { label: t('home.footer.courseMaker'), href: '/course-maker-free' },
    { label: t('home.footer.educationalBlogs'), href: ROUTES.blogs },
    { label: t('home.footer.publicCourses'), href: ROUTES.courses },
    { label: t('home.footer.allTools'), href: ROUTES.toolsIndex },
  ],
  auth: [
    { label: t('home.login'), href: ROUTES.login },
    { label: t('home.register'), href: ROUTES.register },
  ],
});

export default function Footer() {
  const { t } = useTranslation();
  const enableBlogs = useFeature('enableBlogs');
  const enableCourses = useFeature('enableCourses');
  const currentYear = new Date().getFullYear();

  const resourceLinks = getFooterLinks(t).resources.filter((link) => {
    if (link.href === ROUTES.blogs) return enableBlogs;
    if (link.href === ROUTES.courses) return enableCourses;
    return true;
  });

  return (
    <footer className="relative overflow-hidden bg-[var(--background)] text-[var(--foreground)] border-t border-[var(--border)]/30 mt-12 sm:mt-24">
      {/* Subtle Aurora Glow at the bottom */}
      <div className="absolute inset-0 pointer-events-none aria-hidden overflow-hidden">
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-[var(--student-primary)]/10 rounded-full blur-[120px] -z-10 mix-blend-screen" />
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 sm:pt-24 sm:pb-16">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-8 mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 rounded-2xl antigravity-glass shadow-sm">
                <PremiumLogo variant="default" size="md" theme="dark" />
              </div>
            </div>
            <p className="text-[var(--muted)] text-sm sm:text-base leading-relaxed max-w-sm mb-6 lg:mb-0">
              {t('home.footer.tagline')}
            </p>
          </motion.div>

          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex flex-col"
            >
              <h3 className="text-sm font-bold tracking-wider uppercase text-[var(--foreground)] mb-4">{t('home.footer.product')}</h3>
              <ul className="flex flex-col gap-3">
                {getFooterLinks(t).product.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--muted)] hover:text-[var(--student-primary)] hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-col"
            >
              <h3 className="text-sm font-bold tracking-wider uppercase text-[var(--foreground)] mb-4">{t('home.footer.resources')}</h3>
              <ul className="flex flex-col gap-3">
                {resourceLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--muted)] hover:text-[var(--student-primary)] hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="col-span-2 sm:col-span-1 flex flex-col"
            >
              <h3 className="text-sm font-bold tracking-wider uppercase text-[var(--foreground)] mb-4">{t('home.footer.getStarted')}</h3>
              <ul className="flex flex-col gap-3">
                {getFooterLinks(t).auth.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--muted)] hover:text-[var(--student-primary)] hover:translate-x-1 inline-block transition-all duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-[var(--color-muted)] text-sm" suppressHydrationWarning>
            {t('home.footer.copyright', { year: currentYear, siteName: SITE_NAME })}{' '}
            {t('home.footer.rights')}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-[var(--color-muted)]">
            <Link href={ROUTES.privacy} className="hover:text-[var(--foreground)] transition-colors">
              {t('home.footer.privacyPolicy')}
            </Link>
            <span>•</span>
            <Link href={ROUTES.terms} className="hover:text-[var(--foreground)] transition-colors">
              {t('home.footer.termsOfService')}
            </Link>
            <span>•</span>
            <Link href={ROUTES.contact} className="hover:text-[var(--foreground)] transition-colors">
              {t('contact.title')}
            </Link>
          </div>
          <p className="text-[var(--color-muted)] text-sm flex items-center justify-center gap-1">
            {t('home.footer.madeWith')}{' '}
            <Heart className="w-4 h-4 text-[var(--color-error)] fill-[var(--color-error)]" aria-hidden />{' '}
            {t('home.footer.inIndia')}
          </p>
        </div>
      </div>
    </footer>
  );
}
