import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Power, UserPlus, GraduationCap } from 'lucide-react';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { useTranslation } from '@/hooks/useTranslation';
import type { AppSettings } from './types';

type Props = {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
  theme: { text: string };
};

export function PlatformConfigSection({ settings, setSettings, theme }: Props) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[var(--card-solid)] rounded-xl shadow-sm p-4 sm:p-5 border border-[var(--border)]"
    >
      <h2 className="text-base sm:text-lg font-semibold text-[var(--color-foreground)] mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5" />
        {t('adminSettings.platformConfig')}
      </h2>

      <div className="flex flex-col gap-2.5 sm:gap-3">
        {/* Maintenance Mode */}
        <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-[var(--color-surface-muted)] rounded-lg">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Power className={`w-5 h-5 shrink-0 ${theme.text}`} />
            <div className="min-w-0">
              <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.maintenanceMode')}</p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{t('adminSettings.maintenanceModeDesc')}</p>
            </div>
          </div>
          <ToggleSwitch
            checked={settings.platformConfig.maintenanceMode}
            onChange={(maintenanceMode) =>
              setSettings({
                ...settings,
                platformConfig: { ...settings.platformConfig, maintenanceMode },
              })
            }
            label={t('adminSettings.maintenanceMode')}
          />
        </div>

        {/* Allow Registration */}
        <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-[var(--color-surface-muted)] rounded-lg">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <UserPlus className={`w-5 h-5 shrink-0 ${theme.text}`} />
            <div className="min-w-0">
              <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.allowRegistration')}</p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{t('adminSettings.allowRegistrationDesc')}</p>
            </div>
          </div>
          <ToggleSwitch
            checked={settings.platformConfig.allowRegistration}
            onChange={(allowRegistration) =>
              setSettings({
                ...settings,
                platformConfig: { ...settings.platformConfig, allowRegistration },
              })
            }
            label={t('adminSettings.allowRegistration')}
          />
        </div>

        {/* Allow Teacher Registration */}
        <div className="flex items-center justify-between gap-3 p-3 sm:p-3.5 bg-[var(--color-surface-muted)] rounded-lg">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <GraduationCap className={`w-5 h-5 shrink-0 ${theme.text}`} />
            <div className="min-w-0">
              <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.allowTeacherRegistration')}</p>
              <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{t('adminSettings.allowTeacherRegistrationDesc')}</p>
            </div>
          </div>
          <ToggleSwitch
            checked={settings.platformConfig.allowTeacherRegistration}
            onChange={(allowTeacherRegistration) =>
              setSettings({
                ...settings,
                platformConfig: { ...settings.platformConfig, allowTeacherRegistration },
              })
            }
            label={t('adminSettings.allowTeacherRegistration')}
            disabled={!settings.platformConfig.allowRegistration}
          />
        </div>
      </div>
    </motion.div>
  );
}
