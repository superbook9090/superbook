'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Zap, Bell, CheckCircle2, ArrowRight } from 'lucide-react';
import { useFeature } from '@/contexts/AppSettingsContext';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { isMobileApp } from '@/lib/mobile/mobileDetection';
import { sendGAEvent } from '@next/third-parties/google';

const DISMISSED_STORAGE_KEY = 'quizdo_download_app_dismissed';
const LOGIN_TIME_KEY = 'quizdo_login_time';
const JUST_LOGGED_IN_KEY = 'quizdo_just_logged_in';

export default function DownloadAppPopup() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const enableDownloadAppPopup = useFeature('enableDownloadAppPopup');

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    try {
      sessionStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
      localStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
    } catch {
      // Storage unavailable
    }
  }, []);

  const handleDownloadClick = () => {
    try {
      sendGAEvent({ event: 'download_app_popup_click', source: 'post_login_popup' });
      sessionStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
      localStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
    } catch {
      // Ignore analytics error
    }
    setIsVisible(false);
    window.open(ROUTES.downloadApp, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (!enableDownloadAppPopup) return;
    if (isMobileApp()) {
      try {
        sessionStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
        localStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
      } catch {
        // Storage unavailable
      }
      return;
    }

    try {
      if (
        sessionStorage.getItem(DISMISSED_STORAGE_KEY) === 'true' ||
        localStorage.getItem(DISMISSED_STORAGE_KEY) === 'true'
      ) {
        return;
      }

      const loginTime = sessionStorage.getItem(LOGIN_TIME_KEY);
      const justLoggedIn = sessionStorage.getItem(JUST_LOGGED_IN_KEY) === 'true';

      if (!loginTime && !justLoggedIn) {
        return;
      }

      const now = Date.now();
      let delayMs = 10000; // 10 seconds default

      if (loginTime) {
        const elapsed = now - Number(loginTime);
        // If login was more than 3 minutes ago, do not suddenly trigger
        if (elapsed > 180000) {
          sessionStorage.removeItem(LOGIN_TIME_KEY);
          return;
        }
        delayMs = Math.max(0, 10000 - elapsed);
      }

      const timer = setTimeout(() => {
        // Strict guard: if running inside app, do NOT trigger download popup
        if (isMobileApp()) {
          sessionStorage.removeItem(LOGIN_TIME_KEY);
          sessionStorage.removeItem(JUST_LOGGED_IN_KEY);
          try {
            sessionStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
            localStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
          } catch {
            // Storage error
          }
          return;
        }

        setIsVisible(true);
        sessionStorage.removeItem(LOGIN_TIME_KEY);
        sessionStorage.removeItem(JUST_LOGGED_IN_KEY);
      }, delayMs);

      // Intercept late native bridge injection or late query/storage detection
      const checkInterval = setInterval(() => {
        if (isMobileApp()) {
          clearTimeout(timer);
          clearInterval(checkInterval);
          try {
            sessionStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
            localStorage.setItem(DISMISSED_STORAGE_KEY, 'true');
          } catch {
            // Storage error
          }
        }
      }, 500);

      return () => {
        clearTimeout(timer);
        clearInterval(checkInterval);
      };
    } catch {
      // Session storage error
    }
  }, [enableDownloadAppPopup]);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, handleDismiss]);

  if (!isVisible || isMobileApp()) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[105] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-app-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
          onClick={handleDismiss}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-[var(--card-solid)] border border-[var(--border)] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden z-10 p-4 sm:p-6 md:p-8"
        >
          {/* Subtle Ambient Light Gradients */}
          <div
            className="absolute -top-24 -right-24 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-24 -left-24 w-56 h-56 bg-[var(--primary)]/20 rounded-full blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] rounded-full transition-colors z-20 cursor-pointer"
            aria-label={t('common.close')}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="space-y-6">
            {/* Header Badge & Icon */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-lg shadow-emerald-500/25 flex items-center justify-center">
                  <div className="w-full h-full bg-[var(--card-solid)] rounded-[14px] flex items-center justify-center">
                    <Smartphone className="w-7 h-7 text-emerald-500 animate-pulse" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-xs border-2 border-[var(--card-solid)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  {t('downloadAppPopup.badge')}
                </span>
                <h2
                  id="download-app-title"
                  className="text-xl sm:text-2xl font-black tracking-tight text-[var(--color-foreground)] mt-1"
                >
                  {t('downloadAppPopup.title')}
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] leading-relaxed">
              {t('downloadAppPopup.subtitle')}
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 gap-2.5 pt-1">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--surface-muted)]/70 border border-[var(--border)]/60">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--color-foreground)]">
                    {t('downloadAppPopup.feature1Title')}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5">
                    {t('downloadAppPopup.feature1Desc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--surface-muted)]/70 border border-[var(--border)]/60">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 shrink-0 mt-0.5">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--color-foreground)]">
                    {t('downloadAppPopup.feature2Title')}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5">
                    {t('downloadAppPopup.feature2Desc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--surface-muted)]/70 border border-[var(--border)]/60">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--color-foreground)]">
                    {t('downloadAppPopup.feature3Title')}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5">
                    {t('downloadAppPopup.feature3Desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadClick}
                className="w-full flex-1 flex items-center justify-center gap-2 py-3.5 px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-[0_4px_16px_0_rgba(16,185,129,0.35)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-xs sm:text-sm group"
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>{t('downloadAppPopup.ctaButton')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-[var(--border)] text-xs sm:text-sm font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
              >
                {t('downloadAppPopup.dismissButton')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
