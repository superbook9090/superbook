/**
 * Haptic Feedback Engine using HTML5 Vibration API and Quizdo Native Mobile Shell Bridge.
 * Provides tactile feedback for mobile web, PWA, and React Native mobile app interactions.
 */

type HapticType = 'selection' | 'impact' | 'success' | 'warning' | 'error' | 'celebration';

interface QuizdoNativeBridge {
  haptic?: (type: HapticType) => boolean;
  vibrate?: (pattern: number | number[]) => boolean;
}

function getNativeApp(): QuizdoNativeBridge | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { QuizdoNativeApp?: QuizdoNativeBridge }).QuizdoNativeApp;
}

function vibrate(pattern: number | number[], type?: HapticType): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // 1. Try React Native mobile shell bridge first for physical device vibration
  const nativeApp = getNativeApp();
  if (nativeApp) {
    if (type && typeof nativeApp.haptic === 'function') {
      try {
        if (nativeApp.haptic(type)) return true;
      } catch {
        // fallback
      }
    }
    if (typeof nativeApp.vibrate === 'function') {
      try {
        if (nativeApp.vibrate(pattern)) return true;
      } catch {
        // fallback
      }
    }
  }

  // 2. Fall back to standard HTML5 Vibration API
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      return navigator.vibrate(pattern);
    } catch {
      return false;
    }
  }

  return false;
}

export const haptics = {
  /** Subtle 8ms tick for selecting quiz/contest options */
  selection: () => vibrate(8, 'selection'),

  /** 15ms medium tap for button presses and navigation */
  impact: () => vibrate(15, 'impact'),

  /** Light two-beat pulse for saving or completing an action */
  success: () => vibrate([12, 40, 15], 'success'),

  /** Double buzz for timer low warnings or non-blocking alerts */
  warning: () => vibrate([35, 40, 35], 'warning'),

  /** Heavy alert vibration for security violations (tab switch, exit) */
  error: () => vibrate([60, 50, 60], 'error'),

  /** Celebratory pattern for winning challenges or completing assessments */
  celebration: () => vibrate([40, 60, 40, 60, 100], 'celebration'),

  /** Custom vibration pattern */
  custom: (pattern: number | number[]) => vibrate(pattern),

  /** Cancel any active vibration */
  cancel: () => vibrate(0),
};
