'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ExternalLink, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Github, Twitter, Linkedin, Facebook, Instagram } from './BrandIcons';

export function ContactInfo() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      {/* Contact Cards Container */}
      <div className="antigravity-glass border border-[var(--border)] rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base font-black uppercase tracking-tight text-[var(--color-foreground)]">
            {t('contact.info.title')}
          </h3>
        </div>

        <div className="space-y-3.5">
          {/* Email Address */}
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="group relative p-4 rounded-2xl antigravity-glass border border-[var(--border)] hover:border-[var(--primary)]/40 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary-accent)]/10 text-[var(--primary)] shadow-xs shrink-0 group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  {t('contact.info.email')}
                </h4>
                <a
                  href="mailto:quizdo9090@gmail.com"
                  className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] group-hover:text-[var(--primary)] transition-colors truncate block"
                >
                  quizdo9090@gmail.com
                </a>
              </div>
              <ExternalLink className="w-4 h-4 text-[var(--color-muted-foreground)] opacity-0 group-hover:opacity-100 group-hover:text-[var(--primary)] transition-all shrink-0" />
            </div>
          </motion.div>

          {/* Phone Number */}
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="group relative p-4 rounded-2xl antigravity-glass border border-[var(--border)] hover:border-[var(--primary)]/40 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs shrink-0 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  {t('contact.info.phone')}
                </h4>
                <a
                  href="tel:+917052836069"
                  className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate block"
                >
                  +91 7052836069
                </a>
              </div>
              <ExternalLink className="w-4 h-4 text-[var(--color-muted-foreground)] opacity-0 group-hover:opacity-100 group-hover:text-emerald-500 transition-all shrink-0" />
            </div>
          </motion.div>

          {/* Office Location */}
          <motion.div
            whileHover={{ y: -3, scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="group relative p-4 rounded-2xl antigravity-glass border border-[var(--border)] hover:border-[var(--primary)]/40 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-600 dark:text-amber-400 shadow-xs shrink-0 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-[var(--color-muted-foreground)]">
                  {t('contact.info.office')}
                </h4>
                <p className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] leading-relaxed group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {t('contact.info.officeValue')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Social Channels */}
        <div className="pt-6 mt-6 border-t border-[var(--border)]">
          <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3.5">
            {t('contact.info.socials')}
          </h4>
          <div className="flex items-center gap-2.5 flex-wrap">
            {[
              { icon: Instagram, href: 'https://www.instagram.com/quiz_do__/?hl=en', name: 'Instagram', color: 'hover:text-pink-500 hover:border-pink-500/40 hover:bg-pink-500/10' },
              { icon: Github, href: 'https://github.com', name: 'GitHub', color: 'hover:text-slate-800 dark:hover:text-white hover:border-slate-800/40 dark:hover:border-white/40 hover:bg-slate-800/10 dark:hover:bg-white/10' },
              { icon: Twitter, href: 'https://twitter.com', name: 'Twitter', color: 'hover:text-blue-400 hover:border-blue-400/40 hover:bg-blue-400/10' },
              { icon: Linkedin, href: 'https://linkedin.com', name: 'LinkedIn', color: 'hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600/40 dark:hover:border-blue-400/40 hover:bg-blue-600/10 dark:hover:bg-blue-400/10' },
              { icon: Facebook, href: 'https://facebook.com', name: 'Facebook', color: 'hover:text-blue-500 hover:border-blue-500/40 hover:bg-blue-500/10' },
            ].map((soc, idx) => (
              <motion.a
                key={idx}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit our ${soc.name}`}
                whileHover={{ y: -3, scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2.5 sm:p-3 rounded-xl antigravity-glass border border-[var(--border)] text-[var(--color-muted-foreground)] transition-all shadow-xs cursor-pointer ${soc.color}`}
              >
                <soc.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded interactive spatial map card */}
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        className="antigravity-glass border border-[var(--border)] rounded-3xl shadow-lg relative h-[200px] overflow-hidden flex items-center justify-center group cursor-pointer"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface-muted)]/90 via-transparent to-transparent z-0" />
        <div className="absolute top-0 right-0 w-44 h-44 bg-[var(--primary)]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-accent)] flex items-center justify-center mb-2.5 text-white shadow-md shadow-[var(--primary)]/30 group-hover:scale-110 transition-transform">
            <MapPin className="w-6 h-6 animate-bounce" />
          </div>
          <span className="text-xs sm:text-sm font-black text-[var(--color-foreground)] uppercase tracking-wider mb-1">
            {t('contact.info.mapMock')}
          </span>
          <span className="text-xs text-[var(--color-muted-foreground)] font-semibold max-w-xs">
            {t('contact.info.officeValue')}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
