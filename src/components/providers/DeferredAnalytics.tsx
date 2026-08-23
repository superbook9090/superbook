'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useSettingsStore } from '@/store/useSettingsStore';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-DRRECK67YF';
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-PRZ4PRLN';

export default function DeferredAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const enableAnalytics = useSettingsStore((s) => s.settings.featureToggles.enableAnalytics ?? true);

  // Send pageview on App Router client-side route changes
  useEffect(() => {
    if (!enableAnalytics || !pathname) return;
    const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).gtag('config', GA_ID, {
        page_path: url,
      });
    }
  }, [pathname, searchParams, enableAnalytics]);

  if (!enableAnalytics) return null;

  return (
    <>
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      <Analytics />
      <SpeedInsights />
    </>
  );
}

