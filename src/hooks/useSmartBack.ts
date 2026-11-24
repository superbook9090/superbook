'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  canGoBackInApp,
  getLastSafeInternalUrl,
  getPreviousInternalUrl,
  isAuthRoute,
  isTransientTakeRoute,
} from '@/lib/navigation/historyTracker';

/**
 * Navigates back to the exact previous in-app route (preserving URL query params
 * such as active tabs and filters) when the user arrived via internal navigation.
 * Safely falls back to `fallbackHref` when opened directly (e.g. new tab / deep link)
 * or if the previous entry was a transient take/auth route.
 */
export function useSmartBack(fallbackHref: string): () => void {
  const router = useRouter();

  return useCallback(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const returnTo = params.get('returnTo') || params.get('from');
      if (returnTo && returnTo.startsWith('/') && !returnTo.startsWith('//')) {
        router.push(returnTo);
        return;
      }

      if (canGoBackInApp()) {
        const prev = getPreviousInternalUrl();
        if (prev && !isTransientTakeRoute(prev) && !isAuthRoute(prev)) {
          router.back();
          return;
        }
        const safePrev = getLastSafeInternalUrl(window.location.pathname);
        if (safePrev) {
          router.push(safePrev);
          return;
        }
      }
    }

    router.push(fallbackHref);
  }, [router, fallbackHref]);
}
