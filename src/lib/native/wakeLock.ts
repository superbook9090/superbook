/**
 * Screen Wake Lock API helper.
 * Keeps the screen awake during active assessments, quizzes, and contests.
 */

type WakeLockSentinel = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: 'release', listener: () => void) => void;
  removeEventListener: (type: 'release', listener: () => void) => void;
};

export async function requestWakeLock(): Promise<WakeLockSentinel | null> {
  if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sentinel = await (navigator as any).wakeLock.request('screen');
    return sentinel as WakeLockSentinel;
  } catch (err) {
    // Some browsers reject wakeLock when battery is critically low or tab is not active
    console.debug('[WakeLock] Unable to acquire wake lock:', err);
    return null;
  }
}

export async function releaseWakeLock(sentinel: WakeLockSentinel | null): Promise<void> {
  if (!sentinel || sentinel.released) return;
  try {
    await sentinel.release();
  } catch (err) {
    console.debug('[WakeLock] Error releasing wake lock:', err);
  }
}
