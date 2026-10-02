'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, AlertCircle, FileText, Link as LinkIcon, GitCommit, ShieldCheck } from 'lucide-react';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { useTranslation } from '@/hooks/useTranslation';
import type { AppSettings } from './types';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  searchQuery?: string;
}

export function AppVersionSection({ settings, setSettings, searchQuery = '' }: Props) {
  const { t } = useTranslation();

  const query = searchQuery.trim().toLowerCase();
  const config = settings.appVersionConfig || {
    latestVersion: '1.10.10',
    minRequiredVersion: '1.0.0',
    forceUpdate: false,
    updateUrl: 'https://play.google.com/store/apps/details?id=com.quizdo',
    releaseNotes: '',
    enabled: true,
  };

  const matches =
    !query ||
    'app'.includes(query) ||
    'version'.includes(query) ||
    'update'.includes(query) ||
    t('adminSettings.appVersionSection').toLowerCase().includes(query) ||
    t('adminSettings.latestAppVersion').toLowerCase().includes(query) ||
    t('adminSettings.minRequiredVersion').toLowerCase().includes(query) ||
    t('adminSettings.forceAppUpdate').toLowerCase().includes(query);

  if (!matches) return null;

  const updateConfig = (patch: Partial<typeof config>) => {
    setSettings((prev) => ({
      ...prev,
      appVersionConfig: {
        ...(prev.appVersionConfig || config),
        ...patch,
      },
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-surface rounded-xl border border-[var(--border)] overflow-hidden shadow-xs space-y-0"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--border)]/70 bg-[var(--color-surface-muted)]/30">
        <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[var(--primary)]" />
          {t('adminSettings.appVersionSection')}
        </h3>
        <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
          {t('adminSettings.appVersionSectionDesc')}
        </p>
      </div>

      <div className="divide-y divide-[var(--border)]/60">
        {/* Master Enable Toggle */}
        <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-[var(--color-surface-muted)]/30 transition-colors">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-xs sm:text-sm text-[var(--color-foreground)]">
                {t('adminSettings.appUpdateEnabled')}
              </h4>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-relaxed">
                {t('adminSettings.appUpdateEnabledDesc')}
              </p>
            </div>
          </div>
          <ToggleSwitch
            checked={config.enabled}
            onChange={(enabled) => updateConfig({ enabled })}
            label={t('adminSettings.appUpdateEnabled')}
          />
        </div>

        {/* Latest Version & Minimum Required Version */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3.5 sm:p-4 bg-[var(--surface-muted)]/20">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-foreground)] flex items-center gap-1.5">
              <GitCommit className="w-4 h-4 text-emerald-500" />
              <span>{t('adminSettings.latestAppVersion')}</span>
            </label>
            <p className="text-[11px] text-[var(--color-muted-foreground)]">
              {t('adminSettings.latestAppVersionDesc')}
            </p>
            <input
              type="text"
              value={config.latestVersion}
              onChange={(e) => updateConfig({ latestVersion: e.target.value })}
              placeholder="1.2.0"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--color-foreground)] flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span>{t('adminSettings.minRequiredVersion')}</span>
            </label>
            <p className="text-[11px] text-[var(--color-muted-foreground)]">
              {t('adminSettings.minRequiredVersionDesc')}
            </p>
            <input
              type="text"
              value={config.minRequiredVersion}
              onChange={(e) => updateConfig({ minRequiredVersion: e.target.value })}
              placeholder="1.0.0"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Force Update Toggle */}
        <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-[var(--color-surface-muted)]/30 transition-colors">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 shrink-0 shadow-xs">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-xs sm:text-sm text-[var(--color-foreground)]">
                {t('adminSettings.forceAppUpdate')}
              </h4>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-relaxed">
                {t('adminSettings.forceAppUpdateDesc')}
              </p>
            </div>
          </div>
          <ToggleSwitch
            checked={config.forceUpdate}
            onChange={(forceUpdate) => updateConfig({ forceUpdate })}
            label={t('adminSettings.forceAppUpdate')}
          />
        </div>

        {/* Update URL */}
        <div className="p-3.5 sm:p-4 space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-foreground)] flex items-center gap-1.5">
            <LinkIcon className="w-4 h-4 text-[var(--primary)]" />
            <span>{t('adminSettings.updateUrl')}</span>
          </label>
          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {t('adminSettings.updateUrlDesc')}
          </p>
          <input
            type="url"
            value={config.updateUrl || ''}
            onChange={(e) => updateConfig({ updateUrl: e.target.value })}
            placeholder="https://play.google.com/store/apps/details?id=com.quizdo"
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        {/* Release Notes */}
        <div className="p-3.5 sm:p-4 space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-foreground)] flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>{t('adminSettings.releaseNotes')}</span>
          </label>
          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {t('adminSettings.releaseNotesDesc')}
          </p>
          <textarea
            rows={3}
            value={config.releaseNotes || ''}
            onChange={(e) => updateConfig({ releaseNotes: e.target.value })}
            placeholder="• Performance improvements&#10;• Bug fixes in contest arena&#10;• Faster quiz question loading"
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-y"
          />
        </div>
      </div>
    </motion.div>
  );
}
