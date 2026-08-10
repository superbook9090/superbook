import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Github, Twitter, Linkedin, Facebook, Instagram } from './BrandIcons';

export function ContactInfo() {
  const { t } = useTranslation();

  return (
    <>
      <div className="glass border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
        <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-foreground)] mb-6">
          {t('contact.info.title')}
        </h3>

        <div className="space-y-6">
          {/* Email Address */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[var(--primary-soft)] border border-[var(--primary-border)] text-[var(--primary)] shadow-sm flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-muted)] mb-1">
                {t('contact.info.email')}
              </h4>
              <a href="mailto:quizdo9090@gmail.com" className="text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline transition-all">
                quizdo9090@gmail.com
              </a>
            </div>
          </div>

          {/* Phone Number */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[var(--primary-soft)] border border-[var(--primary-border)] text-[var(--primary)] shadow-sm flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-muted)] mb-1">
                {t('contact.info.phone')}
              </h4>
              <a href="tel:+15551234567" className="text-sm font-bold text-[var(--color-foreground)] hover:text-[var(--primary)] transition-colors">
                7052836069
              </a>
            </div>
          </div>

          {/* Office Location */}
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[var(--primary-soft)] border border-[var(--primary-border)] text-[var(--primary)] shadow-sm flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-muted)] mb-1">
                {t('contact.info.office')}
              </h4>
              <p className="text-sm font-bold text-[var(--color-foreground)] leading-relaxed">
                {t('contact.info.officeValue')}
              </p>
            </div>
          </div>
        </div>

        {/* Social Channels */}
        <div className="pt-8 mt-8 border-t border-[var(--color-border)]">
          <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-muted)] mb-4">
            {t('contact.info.socials')}
          </h4>
          <div className="flex items-center gap-3">
            {[
              { icon: Instagram, href: 'https://www.instagram.com/quiz_do__/?hl=en', name: 'Instagram' },
              { icon: Github, href: 'https://github.', name: 'GitHub' },
              { icon: Twitter, href: 'https://twitter.', name: 'Twitter' },
              { icon: Linkedin, href: 'https://linkedin.', name: 'LinkedIn' },
              { icon: Facebook, href: 'https://facebook.', name: 'Facebook' },
            ].map((soc, idx) => (
              <motion.a
                key={idx}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit our ${soc.name}`}
                whileHover={{ y: -3, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-2xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:bg-[var(--primary-soft)] hover:border-[var(--primary-border)] text-[var(--color-muted-foreground)] hover:text-[var(--primary)] transition-all shadow-sm"
              >
                <soc.icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded interactive map block mock */}
      <div className="glass border border-[var(--color-border)] rounded-3xl p-4 shadow-md backdrop-blur-xl relative h-[220px] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[var(--color-surface-muted)] flex flex-col items-center justify-center p-6 text-center">
          <MapPin className="w-8 h-8 text-[var(--primary)] mb-2 animate-bounce" />
          <span className="text-xs font-black text-[var(--color-foreground)] uppercase tracking-widest mb-1">{t('contact.info.mapMock')}</span>
          <span className="text-[11px] text-[var(--color-muted-foreground)] font-semibold">{t('contact.info.officeValue')}</span>
        </div>
      </div>
    </>
  );
}
