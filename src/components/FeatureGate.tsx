'use client';

import type { ReactNode } from 'react';
import { useAppSettings, useFeature } from '@/contexts/AppSettingsContext';
import type { FeatureToggleKey } from '@/store/useSettingsStore';

type FeatureGateProps = {
  feature: FeatureToggleKey;
  children: ReactNode;
};

/** Renders children only when a feature toggle is enabled (hidden while settings load). */
export default function FeatureGate({ feature, children }: FeatureGateProps) {
  const enabled = useFeature(feature);
  const { isLoading } = useAppSettings();

  if (isLoading || !enabled) {
    return null;
  }

  return <>{children}</>;
}
