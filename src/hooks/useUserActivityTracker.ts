'use client';

import { useEffect, useRef } from 'react';
import { isAndroidWebView, isIOSWebView } from '@/lib/mobile/mobileDetection';

const ACTIVITY_PING_STORAGE_KEY = 'quizdo_last_activity_ping';
const THROTTLE_MS = 15 * 60 * 1000; // 15 minutes

export function useUserActivityTracker(userId: string | undefined) {
  const hasPingedThisMount = useRef(false);

  useEffect(() => {
    if (!userId) return;

    const recordActivity = () => {
      try {
        const lastPing = localStorage.getItem(ACTIVITY_PING_STORAGE_KEY);
        const now = Date.now();
        if (lastPing && now - parseInt(lastPing, 10) < THROTTLE_MS) {
          return;
        }

        let platform: 'android' | 'ios' | 'web' = 'web';
        if (isAndroidWebView()) {
          platform = 'android';
        } else if (isIOSWebView()) {
          platform = 'ios';
        }

        const payload = JSON.stringify({ platform, path: window.location.pathname });

        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
          const blob = new Blob([payload], { type: 'application/json' });
          navigator.sendBeacon('/api/user/activity', blob);
        } else {
          void fetch('/api/user/activity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }

        localStorage.setItem(ACTIVITY_PING_STORAGE_KEY, String(now));
      } catch {
        // Silently ignore storage or network errors
      }
    };

    if (!hasPingedThisMount.current) {
      hasPingedThisMount.current = true;
      recordActivity();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recordActivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [userId]);
}
