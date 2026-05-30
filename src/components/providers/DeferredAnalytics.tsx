'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const GoogleAnalytics = dynamic(
  () => import('@next/third-parties/google').then((mod) => mod.GoogleAnalytics),
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

  useEffect(() => {
    const enable = () => setEnabled(true);

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(enable, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = setTimeout(enable, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <GoogleAnalytics gaId="G-DRRECK67YF" />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
