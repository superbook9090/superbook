'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Globe, UserPlus, GraduationCap, AlertTriangle, ShieldAlert, Languages } from 'lucide-react';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { useTranslation } from '@/hooks/useTranslation';
import type { AppSettings } from './types';

interface Props {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onToggleMaintenance: (targetValue: boolean) => void;
  searchQuery?: string;
}

export function PlatformConfigSection({
  settings,
  setSettings,
  onToggleMaintenance,
  searchQuery = '',
}: Props) {
  const { t } = useTranslation();

  const query = searchQuery.trim().toLowerCase();

  const matchesGeneral =
    !query ||
    t('adminSettings.platformConfig').toLowerCase().includes(query) ||
    t('adminSettings.allowRegistration').toLowerCase().includes(query) ||
    t('adminSettings.allowTeacherRegistration').toLowerCase().includes(query) ||
    t('adminSettings.defaultLanguage').toLowerCase().includes(query);

  const matchesDanger =
    !query ||
    t('adminSettings.dangerZone').toLowerCase().includes(query) ||
    t('adminSettings.maintenanceMode').toLowerCase().includes(query);

  if (!matchesGeneral && !matchesDanger) return null;

  return (
    <div className="space-y-6">
      {/* General Platform Controls */}
      {matchesGeneral && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface rounded-xl border border-[var(--border)] overflow-hidden shadow-xs"
        >
          <div className="p-4 sm:p-5 border-b border-[var(--border)]/70 bg-[var(--color-surface-muted)]/30">
            <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[var(--primary)]" />
              {t('adminSettings.platformConfig')}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              Configure general system behavior, registration rules, and localization.
            </p>
          </div>

          <div className="divide-y divide-[var(--border)]/60">
            {/* Allow Registration */}
            <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-[var(--color-surface-muted)]/30 transition-colors">
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div className="p-2.5 rounded-xl bg-[var(--success-light)] text-[var(--success)] shrink-0 shadow-xs">
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs sm:text-sm text-[var(--color-foreground)]">
                    {t('adminSettings.allowRegistration')}
                  </h4>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-relaxed">
                    {t('adminSettings.allowRegistrationDesc')}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.platformConfig.allowRegistration}
                onChange={(allowRegistration) =>
                  setSettings((prev) => ({
                    ...prev,
                    platformConfig: { ...prev.platformConfig, allowRegistration },
                  }))
                }
                label={t('adminSettings.allowRegistration')}
              />
            </div>

            {/* Allow Teacher Registration */}
            <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-[var(--color-surface-muted)]/30 transition-colors">
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div className="p-2.5 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] shrink-0 shadow-xs">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs sm:text-sm text-[var(--color-foreground)]">
                    {t('adminSettings.allowTeacherRegistration')}
                  </h4>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-relaxed">
                    {t('adminSettings.allowTeacherRegistrationDesc')}
                  </p>
                </div>
              </div>
              <ToggleSwitch
                checked={settings.platformConfig.allowTeacherRegistration}
                disabled={!settings.platformConfig.allowRegistration}
                onChange={(allowTeacherRegistration) =>
                  setSettings((prev) => ({
                    ...prev,
                    platformConfig: { ...prev.platformConfig, allowTeacherRegistration },
                  }))
                }
                label={t('adminSettings.allowTeacherRegistration')}
              />
            </div>

            {/* Default Platform Language */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 hover:bg-[var(--color-surface-muted)]/30 transition-colors">
              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                <div className="p-2.5 rounded-xl bg-[var(--info-light)] text-[var(--info)] shrink-0 shadow-xs">
                  <Languages className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-xs sm:text-sm text-[var(--color-foreground)]">
                    {t('adminSettings.defaultLanguage')}
                  </h4>
                  <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-relaxed">
                    {t('adminSettings.defaultLanguageDesc')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                {(['en', 'hi'] as const).map((lang) => {
                  const isSelected = settings.platformConfig.defaultLanguage === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() =>
                        setSettings((prev) => ({
                          ...prev,
                          platformConfig: { ...prev.platformConfig, defaultLanguage: lang },
                        }))
                      }
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                          : 'card-surface text-[var(--color-muted)] border-[var(--border)] hover:text-[var(--color-foreground)]'
                      }`}
                    >
                      {lang === 'en' ? 'English (EN)' : 'हिन्दी (HI)'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Danger Zone */}
      {matchesDanger && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[var(--color-error)]/30 bg-[var(--color-error-light)]/10 overflow-hidden shadow-xs"
        >
          <div className="p-4 sm:p-5 border-b border-[var(--color-error)]/20 bg-[var(--color-error-light)]/20 flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[var(--color-error)] flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                {t('adminSettings.dangerZone')}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                {t('adminSettings.dangerZoneDesc')}
              </p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20 uppercase tracking-wider">
              Critical
            </span>
          </div>

          <div className="p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="p-2.5 rounded-xl bg-[var(--color-error)]/15 text-[var(--color-error)] shrink-0 shadow-xs mt-0.5">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-xs sm:text-sm text-[var(--color-foreground)]">
                  {t('adminSettings.maintenanceMode')}
                </h4>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5 leading-relaxed">
                  {t('adminSettings.maintenanceModeDesc')}
                </p>
              </div>
            </div>

            <ToggleSwitch
              checked={settings.platformConfig.maintenanceMode}
              onChange={(val) => onToggleMaintenance(val)}
              label={t('adminSettings.maintenanceMode')}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
