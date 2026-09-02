import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Github, Twitter, Linkedin, Facebook, Instagram } from './BrandIcons';

export function ContactInfo() {
  const { t } = useTranslation();

  return (
    <>
      <div className="glass border border-white/10 dark:border-white/5 rounded-[2rem] p-6 sm:p-8 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-2xl bg-white/40 dark:bg-[#101319]/60">
        <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-foreground)] mb-6 flex items-center gap-2">
          {t('contact.info.title')}
        </h3>

        <div className="space-y-4">
          {/* Email Address */}
          <motion.div whileHover={{ scale: 1.02 }} className="group relative p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 hover:border-[var(--primary)]/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/0 via-[var(--primary)]/5 to-[var(--primary)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] shadow-sm flex-shrink-0 group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1">
                  {t('contact.info.email')}
                </h4>
                <a href="mailto:quizdo9090@gmail.com" className="text-sm font-bold text-[var(--color-foreground)] group-hover:text-[var(--primary)] transition-colors">
                  quizdo9090@gmail.com
                </a>
              </div>
            </div>
          </motion.div>

          {/* Phone Number */}
          <motion.div whileHover={{ scale: 1.02 }} className="group relative p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 hover:border-[var(--primary)]/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/0 via-[var(--primary)]/5 to-[var(--primary)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] shadow-sm flex-shrink-0 group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1">
                  {t('contact.info.phone')}
                </h4>
                <a href="tel:+917052836069" className="text-sm font-bold text-[var(--color-foreground)] group-hover:text-[var(--primary)] transition-colors">
                  7052836069
                </a>
              </div>
            </div>
          </motion.div>

          {/* Office Location */}
          <motion.div whileHover={{ scale: 1.02 }} className="group relative p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 hover:border-[var(--primary)]/30 transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/0 via-[var(--primary)]/5 to-[var(--primary)]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="p-3 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] shadow-sm flex-shrink-0 group-hover:scale-110 group-hover:bg-[var(--primary)] group-hover:text-white transition-all duration-300">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-muted-foreground)] mb-1">
                  {t('contact.info.office')}
                </h4>
                <p className="text-sm font-bold text-[var(--color-foreground)] leading-relaxed group-hover:text-[var(--primary)] transition-colors">
                  {t('contact.info.officeValue')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Social Channels */}
        <div className="pt-8 mt-8 border-t border-white/10 dark:border-white/5">
          <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-muted-foreground)] mb-4">
            {t('contact.info.socials')}
          </h4>
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { icon: Instagram, href: 'https://www.instagram.com/quiz_do__/?hl=en', name: 'Instagram', color: 'hover:text-pink-500 hover:border-pink-500/30 hover:bg-pink-500/10' },
              { icon: Github, href: 'https://github.', name: 'GitHub', color: 'hover:text-slate-800 dark:hover:text-white hover:border-slate-800/30 dark:hover:border-white/30 hover:bg-slate-800/10 dark:hover:bg-white/10' },
              { icon: Twitter, href: 'https://twitter.', name: 'Twitter', color: 'hover:text-blue-400 hover:border-blue-400/30 hover:bg-blue-400/10' },
              { icon: Linkedin, href: 'https://linkedin.', name: 'LinkedIn', color: 'hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-600/30 dark:hover:border-blue-400/30 hover:bg-blue-600/10 dark:hover:bg-blue-400/10' },
              { icon: Facebook, href: 'https://facebook.', name: 'Facebook', color: 'hover:text-blue-500 hover:border-blue-500/30 hover:bg-blue-500/10' },
            ].map((soc, idx) => (
              <motion.a
                key={idx}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit our ${soc.name}`}
                whileHover={{ y: -4, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-xl bg-white/50 dark:bg-black/20 border border-white/20 dark:border-white/5 text-[var(--color-muted-foreground)] transition-all shadow-sm ${soc.color}`}
              >
                <soc.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>

      {/* Embedded interactive map block mock */}
      <motion.div 
        whileHover={{ scale: 1.02 }} 
        className="glass border border-white/10 dark:border-white/5 rounded-[2rem] shadow-[0_10px_30px_-10px_rgba(var(--primary-rgb),0.2)] backdrop-blur-2xl relative h-[240px] overflow-hidden flex items-center justify-center bg-white/40 dark:bg-[#101319]/60 group cursor-pointer"
      >
        <div className="absolute inset-0 bg-[url('/map-pattern.svg')] opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-white/20 to-transparent dark:from-black/80 dark:via-black/20 z-0" />
        <div className="relative z-10 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-[var(--primary)]/20 flex items-center justify-center mb-3 group-hover:bg-[var(--primary)] group-hover:text-white text-[var(--primary)] shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all duration-300">
            <MapPin className="w-6 h-6 animate-bounce" />
          </div>
          <span className="text-sm font-black text-[var(--color-foreground)] uppercase tracking-widest mb-1">{t('contact.info.mapMock')}</span>
          <span className="text-xs text-[var(--color-muted-foreground)] font-semibold">{t('contact.info.officeValue')}</span>
        </div>
      </motion.div>
    </>
  );
}
