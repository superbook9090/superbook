'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSettingsStore } from '@/store/useSettingsStore';

const GoogleAnalytics = dynamic(
  () => import('@next/third-parties/google').then((mod) => mod.GoogleAnalytics),
  { ssr: false }
);
const GoogleTagManager = dynamic(
  () => import('@next/third-parties/google').then((mod) => mod.GoogleTagManager),
  { ssr: false }
);
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then((mod) => mod.Analytics),
  { ssr: false }
);
const SpeedInsights = dynamic(
  () => import('@vercel/speed-insights/next').then((mod) => mod.SpeedInsights),
  { ssr: false }
);

export default function DeferredAnalytics() {
  const [enabled, setEnabled] = useState(false);
  const enableAnalytics = useSettingsStore((s) => s.settings.featureToggles.enableAnalytics ?? true);

  useEffect(() => {
    if (!enableAnalytics) {
      setEnabled(false);
      return;
    }
    const enable = () => setEnabled(true);

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(enable, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = setTimeout(enable, 1500);
    return () => clearTimeout(timer);
  }, [enableAnalytics]);

  if (!enableAnalytics || !enabled) return null;

  return (
    <>
      <GoogleTagManager gtmId="GTM-PRZ4PRLN" />
      <GoogleAnalytics gaId="G-DRRECK67YF" />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
