'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, ShieldAlert, ArrowRight, X, Sparkles } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { isMobileApp } from '@/lib/mobile/mobileDetection';
import { getCurrentAppVersion, isUpdateDismissed, dismissUpdate } from '@/lib/mobile/appVersion';
import { isUpdateAvailable, isForceUpdateRequired } from '@/lib/mobile/versionCompare';
import { openExternalLinkViaNativeApp } from '@/lib/mobile/webviewBridge';

export default function AppUpdateModal() {
  const { t } = useTranslation();
  const appVersionConfig = useSettingsStore((s) => s.settings.appVersionConfig);
  const [isOpen, setIsOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);

  const latestVersion = appVersionConfig?.latestVersion;
  const minRequiredVersion = appVersionConfig?.minRequiredVersion;
  const forceUpdateFlag = appVersionConfig?.forceUpdate ?? false;
  const isEnabled = appVersionConfig?.enabled ?? true;
  const updateUrl = appVersionConfig?.updateUrl || ROUTES.downloadApp;
  const releaseNotes = appVersionConfig?.releaseNotes;

  const isForced = isForceUpdateRequired(currentVersion, minRequiredVersion, forceUpdateFlag);

  useEffect(() => {
    if (!isEnabled || !latestVersion) return;
    if (!isMobileApp()) return;

    const detected = getCurrentAppVersion();
    setCurrentVersion(detected);

    if (detected && isUpdateAvailable(detected, latestVersion)) {
      const forced = isForceUpdateRequired(detected, minRequiredVersion, forceUpdateFlag);
      if (forced || !isUpdateDismissed(latestVersion)) {
        setIsOpen(true);
      }
    }
  }, [isEnabled, latestVersion, minRequiredVersion, forceUpdateFlag]);

  const handleDismiss = useCallback(() => {
    if (isForced) return;
    if (latestVersion) {
      dismissUpdate(latestVersion);
    }
    setIsOpen(false);
  }, [isForced, latestVersion]);

  const handleUpdate = () => {
    const targetUrl = updateUrl || ROUTES.downloadApp;
    if (!openExternalLinkViaNativeApp(targetUrl)) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
    if (!isForced) {
      handleDismiss();
    }
  };

  // Prevent ESC key dismissal when forced
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isForced) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isForced, handleDismiss]);

  if (!isOpen || !latestVersion) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-update-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
          onClick={() => {
            if (!isForced) handleDismiss();
          }}
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[var(--card-solid)] border border-[var(--border)] rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden z-10 p-5 sm:p-6"
        >
          {/* Ambient Glow */}
          <div
            className={`absolute -top-24 -right-24 w-52 h-52 rounded-full blur-3xl pointer-events-none ${
              isForced ? 'bg-rose-500/20' : 'bg-emerald-500/20'
            }`}
            aria-hidden="true"
          />

          {/* Close button for non-forced updates */}
          {!isForced && (
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] rounded-full transition-colors z-20 cursor-pointer"
              aria-label={t('common.close')}
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="space-y-5">
            {/* Header Badge & Icon */}
            <div className="flex items-center gap-3.5">
              <div
                className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg shrink-0 ${
                  isForced
                    ? 'bg-rose-500/15 border border-rose-500/30 text-rose-500 shadow-rose-500/10'
                    : 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 shadow-emerald-500/10'
                }`}
              >
                {isForced ? <ShieldAlert className="w-7 h-7" /> : <Rocket className="w-7 h-7" />}
              </div>

              <div className="min-w-0 flex-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase border ${
                    isForced
                      ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25'
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  {isForced ? t('appUpdateModal.mandatoryBadge') : t('appUpdateModal.badge')}
                </span>
                <h2
                  id="app-update-title"
                  className="text-lg sm:text-xl font-black tracking-tight text-[var(--color-foreground)] mt-1 truncate"
                >
                  {isForced ? t('appUpdateModal.forceTitle') : t('appUpdateModal.title')}
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] leading-relaxed">
              {isForced ? t('appUpdateModal.forceSubtitle') : t('appUpdateModal.subtitle')}
            </p>

            {/* Version comparison banner */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-muted)]/80 border border-[var(--border)]/70 text-xs">
              <div className="text-center flex-1">
                <p className="text-[10px] text-[var(--color-muted-foreground)] uppercase font-bold tracking-wider">
                  {t('appUpdateModal.currentVersion')}
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-[var(--color-foreground)] mt-0.5">
                  v{currentVersion || '1.0.0'}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[var(--color-muted-foreground)] shrink-0" />
              <div className="text-center flex-1">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-wider">
                  {t('appUpdateModal.latestVersion')}
                </p>
                <p className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  v{latestVersion}
                </p>
              </div>
            </div>

            {/* Release notes */}
            {releaseNotes && (
              <div className="p-3.5 rounded-2xl bg-[var(--surface-muted)]/50 border border-[var(--border)]/60 text-xs space-y-1">
                <p className="font-bold text-[var(--color-foreground)] text-[11px] uppercase tracking-wider">
                  {t('appUpdateModal.whatsNew')}
                </p>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed whitespace-pre-line text-xs">
                  {releaseNotes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleUpdate}
                className="w-full flex-1 flex items-center justify-center gap-2 py-3 px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl shadow-[0_4px_16px_0_rgba(16,185,129,0.35)] hover:shadow-[0_6px_22px_rgba(16,185,129,0.45)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer text-xs sm:text-sm group"
              >
                <span>{t('appUpdateModal.updateNow')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              {!isForced && (
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full sm:w-auto px-4 py-3 rounded-2xl border border-[var(--border)] text-xs sm:text-sm font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                >
                  {t('appUpdateModal.maybeLater')}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
