"use client";

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';

const BLOCKED_ADSENSE_PREFIXES = [
  '/dashboard',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/maintenance',
  '/privacy-spacesaver',
];

function isAdsenseAllowedPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return !BLOCKED_ADSENSE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default function AdsenseInit() {
  const pathname = usePathname();
  const enableAdsense = useSettingsStore(
    (s) => s.settings?.featureToggles?.enableGoogleAdsense ?? true
  );

  if (!enableAdsense || !isAdsenseAllowedPath(pathname)) return null;

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
