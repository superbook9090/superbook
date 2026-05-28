'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import PremiumLogo from '@/components/ui/PremiumLogo';
import { useTranslation } from '@/hooks/useTranslation';
import { Heart } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

const getFooterLinks = (t: (key: string) => string) => ({
  product: [
    { label: t('home.features.title'), href: '#features' },
    { label: t('home.roles.title'), href: '#roles' },
    { label: t('home.about.title'), href: '#about' },
    { label: t('contact.title'), href: ROUTES.contact },
  ],
  auth: [
    { label: t('home.login'), href: ROUTES.login },
    { label: t('home.register'), href: ROUTES.register },
  ],
});

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--color-foreground)] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="sm:col-span-2 lg:col-span-2"
          >
            <div className="flex items-center gap-2 mb-4">
              <PremiumLogo 
                variant="default"
                size="md"
                theme="dark"
              />
            </div>
            <p className="text-[var(--color-muted)] max-w-sm">
              {t('home.footer.tagline')}
            </p>
          </motion.div>

          {/* Product Links */}
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
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Auth Links */}
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
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-[var(--color-surface-muted-strong)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[var(--color-muted)] text-sm">
            © {currentYear} quiz-do. {t('home.footer.rights')}
          </p>
          <p className="text-[var(--color-muted)] text-sm flex items-center gap-1">
            {t('home.footer.madeWith')} <Heart className="w-4 h-4 text-red-500 fill-red-500" /> {t('home.footer.inIndia')}
          </p>
        </div>
      </div>
    </footer>
  );
}
