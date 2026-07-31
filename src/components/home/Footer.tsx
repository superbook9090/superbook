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
    { label: t('home.about.title'), href: '#about' },
    { label: t('contact.title'), href: ROUTES.contact },
  ],
  resources: [
    { label: t('home.footer.freeQuizMaker'), href: '/quiz-maker-free' },
    { label: t('home.footer.aiQuizGenerator'), href: '/ai-quiz-generator' },
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
    <footer className="bg-[var(--card-solid)] text-[var(--foreground)] border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="sm:col-span-2 lg:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <PremiumLogo variant="default" size="md" theme="dark" />
            </div>
            <p className="text-[var(--color-muted)] max-w-sm">
              {t('home.footer.tagline')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="font-semibold mb-4">{t('home.footer.product')}</h4>
            <ul className="space-y-2">
              {getFooterLinks(t).product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
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
          >
            <h4 className="font-semibold mb-4">{t('home.footer.resources')}</h4>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
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
          >
            <h4 className="font-semibold mb-4">{t('home.footer.getStarted')}</h4>
            <ul className="space-y-2">
              {getFooterLinks(t).auth.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[var(--color-muted)] text-sm" suppressHydrationWarning>
            {t('home.footer.copyright', { year: currentYear, siteName: SITE_NAME })}{' '}
            {t('home.footer.rights')}
          </p>
          <p className="text-[var(--color-muted)] text-sm flex items-center gap-1">
            {t('home.footer.madeWith')}{' '}
            <Heart className="w-4 h-4 text-[var(--color-error)] fill-[var(--color-error)]" aria-hidden />{' '}
            {t('home.footer.inIndia')}
          </p>
        </div>
      </div>
    </footer>
  );
}
