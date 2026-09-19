'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isMobileApp, persistIsMobileApp, clearMobileAppPersistence, isMobileAppUserAgent } from '@/lib/mobile/mobileDetection';
import { ROUTES } from '@/constants/routes';

export default function MobileWebviewGuard() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const isWebParam = searchParams.get('web') === 'true' || searchParams.get('app') === 'false';

      if (isWebParam) {
        clearMobileAppPersistence();
        return;
      }

      const isWebviewParam =
        searchParams.get('webview') === 'true' ||
        searchParams.get('app') === 'true' ||
        searchParams.get('isApp') === 'true';

      const userAgent = navigator.userAgent || '';
      const isNativeApp = isWebviewParam || isMobileAppUserAgent(userAgent) || isMobileApp();

      if (isNativeApp) {
        persistIsMobileApp();
      } else {
        clearMobileAppPersistence();
      }
    }
  }, [router]);

  return null;
}
