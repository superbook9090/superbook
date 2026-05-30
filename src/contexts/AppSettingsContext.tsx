'use client';

import { useEffect, type ReactNode } from 'react';
import {
  useSettingsStore,
  type FeatureToggleKey,
  type PublicAppSettings,
  type TeacherLimitKey,
} from '@/store/useSettingsStore';

/** Bootstraps settings fetch once; safe to mount in a single root layout. */
export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  useEffect(() => {
    void fetchSettings();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'settingsTimestamp') {
        void fetchSettings(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchSettings]);

  return <>{children}</>;
}

export function useAppSettings() {
  const settings = useSettingsStore((s) => s.settings);
  const isLoading = useSettingsStore((s) => s.isLoading);
  const error = useSettingsStore((s) => s.error);
  const isFeatureEnabled = useSettingsStore((s) => s.isFeatureEnabled);
  const canCreateContent = useSettingsStore((s) => s.canCreateContent);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  const refetchSettings = async () => {
    await fetchSettings(true);
  };

  return {
    settings: settings as PublicAppSettings | null,
    isLoading,
    error,
    refetchSettings,
    isFeatureEnabled,
    canCreateContent,
  };
}

export function useFeature(feature: FeatureToggleKey) {
  return useSettingsStore((s) => s.settings.featureToggles[feature] ?? true);
}

export type { FeatureToggleKey, PublicAppSettings, TeacherLimitKey };
