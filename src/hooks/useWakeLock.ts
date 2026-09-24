'use client';

import { useEffect, useRef, useCallback } from 'react';
import { requestWakeLock, releaseWakeLock } from '@/lib/native/wakeLock';

type WakeLockSentinel = Awaited<ReturnType<typeof requestWakeLock>>;

export function useWakeLock(enabled: boolean = true) {
  const sentinelRef = useRef<WakeLockSentinel>(null);

  const acquire = useCallback(async () => {
    if (!enabled || typeof document === 'undefined') return;
    if (sentinelRef.current && !sentinelRef.current.released) return;

    sentinelRef.current = await requestWakeLock();
  }, [enabled]);

  const release = useCallback(async () => {
    if (sentinelRef.current) {
      await releaseWakeLock(sentinelRef.current);
      sentinelRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      acquire();
    } else {
      release();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && enabled) {
        acquire();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      release();
    };
  }, [enabled, acquire, release]);

  return { isSupported: typeof window !== 'undefined' && 'wakeLock' in navigator };
}
