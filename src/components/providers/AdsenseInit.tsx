"use client";

import Script from 'next/script';
import { useSettingsStore } from '@/store/useSettingsStore';

export default function AdsenseInit() {
  const enableAdsense = useSettingsStore(
    (s) => s.settings?.featureToggles?.enableGoogleAdsense ?? true
  );

  if (!enableAdsense) return null;

  return (
    <Script
      id="google-adsense-script"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3910555435236193"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
