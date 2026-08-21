'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isMobileApp } from '@/lib/mobile/mobileDetection';
import { ROUTES } from '@/constants/routes';

export default function MobileWebviewGuard() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const isWebviewParam =
        searchParams.get('webview') === 'true' || searchParams.get('app') === 'true';

      if (isMobileApp() || isWebviewParam) {
        router.replace(ROUTES.login);
      }
    }
  }, [router]);

  return null;
}
