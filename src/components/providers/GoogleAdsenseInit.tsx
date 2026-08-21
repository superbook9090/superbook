'use client';

import Script from 'next/script';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function GoogleAdsenseInit() {
  const enableGoogleAdsense = useSettingsStore(
    (s) => s.settings.featureToggles.enableGoogleAdsense ?? true
  );

  if (!enableGoogleAdsense) return null;

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3910555435236193"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
