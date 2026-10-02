import { isMobileApp } from './mobileDetection';

export const APP_VERSION_STORAGE_KEY = 'quizdo_installed_version';
export const DISMISSED_UPDATE_PREFIX = 'quizdo_update_dismissed_';

/**
 * Persists the detected mobile app version in browser storage and cookies.
 */
export function persistCurrentAppVersion(version: string): void {
  if (typeof window === 'undefined' || !version) return;
  try {
    sessionStorage.setItem(APP_VERSION_STORAGE_KEY, version);
    localStorage.setItem(APP_VERSION_STORAGE_KEY, version);
    if (typeof document !== 'undefined') {
      document.cookie = `${APP_VERSION_STORAGE_KEY}=${encodeURIComponent(version)}; path=/; max-age=2592000; SameSite=Lax`;
    }
  } catch {
    // Storage access might fail in restricted sandboxes
  }
}

/**
 * Clears any persisted mobile app version in storage and cookies.
 */
export function clearAppVersionPersistence(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(APP_VERSION_STORAGE_KEY);
    localStorage.removeItem(APP_VERSION_STORAGE_KEY);
    if (typeof document !== 'undefined') {
      document.cookie = `${APP_VERSION_STORAGE_KEY}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  } catch {
    // Storage access might fail in restricted sandboxes
  }
}

/**
 * Extracts app version from a user agent string.
 * Matches patterns like "QuizdoApp/1.2.0", "QuizdoNativeApp/1.0.4", "Quizdo/1.2.0", "Quizdo-Android/1.2.0", "com.quizdo/1.2.0".
 */
export function extractVersionFromUserAgent(ua: string | null | undefined): string | null {
  if (!ua) return null;
  const match = ua.match(/(?:QuizdoNativeApp|QuizdoApp|Quizdo(?:-Android|-iOS)?|com\.quizdo)[/_\s-]?v?(\d+(\.\d+)+)/i);
  return match ? match[1] : null;
}

/**
 * Safely extracts a clean version string from an unknown bridge object.
 */
function extractVersionFromBridgeTarget(target: unknown): string | null {
  if (!target || typeof target !== 'object') return null;
  const b = target as Record<string, unknown>;

  const candidates: unknown[] = [
    typeof b.getAppVersion === 'function' ? (b.getAppVersion as () => unknown)() : undefined,
    typeof b.getVersion === 'function' ? (b.getVersion as () => unknown)() : undefined,
    typeof b.getVersionName === 'function' ? (b.getVersionName as () => unknown)() : undefined,
    b.appVersion,
    b.version,
    b.versionName,
  ];

  for (const c of candidates) {
    if (c != null) {
      const s = String(c).trim().replace(/^v/i, '');
      if (/^\d+(\.\d+)*/.test(s)) {
        return s;
      }
    }
  }
  return null;
}

/**
 * Detects the currently running mobile app version.
 * Checks live native bridge interfaces, user-agent, URL query params, and session storage.
 * If running inside a mobile app shell but no version can be explicitly detected, returns null
 * (never fabricates '1.0.0' to prevent locking out users on unverified or updated builds).
 */
export function getCurrentAppVersion(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check Native Bridge Window properties & methods (Live native truth - most reliable)
  try {
    const win = window as unknown as Record<string, unknown>;
    const bridges = [
      win.QuizdoNativeApp,
      win.AndroidBridge,
      win.Android,
      win.QuizdoApp,
      win.ReactNativeWebView,
    ];

    for (const bridge of bridges) {
      const bridgeVersion = extractVersionFromBridgeTarget(bridge);
      if (bridgeVersion) {
        persistCurrentAppVersion(bridgeVersion);
        return bridgeVersion;
      }
    }
  } catch {
    // Bridge call fallback
  }

  // 2. Check User Agent (Live native header)
  const ua = navigator.userAgent || navigator.vendor || '';
  const uaVersion = extractVersionFromUserAgent(ua);
  if (uaVersion) {
    persistCurrentAppVersion(uaVersion);
    return uaVersion;
  }

  // 3. Check URL query parameters (useful during testing or WebView initial launch)
  try {
    if (window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const queryVersion =
        params.get('appVersion') ||
        params.get('version') ||
        params.get('app_version') ||
        params.get('v');

      if (queryVersion) {
        const cleanQueryVersion = queryVersion.trim().replace(/^v/i, '');
        if (/^\d+(\.\d+)*/.test(cleanQueryVersion)) {
          persistCurrentAppVersion(cleanQueryVersion);
          return cleanQueryVersion;
        }
      }
    }
  } catch {
    // URL parsing fallback
  }

  // 4. Check session storage (saved during the current active app session)
  try {
    const sessionStored = sessionStorage.getItem(APP_VERSION_STORAGE_KEY);
    if (sessionStored && /^\d+(\.\d+)*/.test(sessionStored)) {
      return sessionStored;
    }
  } catch {
    // Storage access fallback
  }

  // If we are NOT in a mobile app, ensure any accidental version cache is cleared
  if (!isMobileApp()) {
    clearAppVersionPersistence();
  }

  // Note: We deliberately do NOT fall back to localStorage.getItem(APP_VERSION_STORAGE_KEY)
  // or return a hardcoded '1.0.0'.
  // If an app was updated from Google Play Store, localStorage retains the old version,
  // which falsely locks users in an infinite update loop.
  // Returning null allows unverified builds / website browsers to operate without false lockouts.
  return null;
}

/**
 * Checks whether the user dismissed a non-forced update in the current session.
 */
export function isUpdateDismissed(version: string): boolean {
  if (typeof window === 'undefined' || !version) return false;
  try {
    return sessionStorage.getItem(`${DISMISSED_UPDATE_PREFIX}${version}`) === 'true';
  } catch {
    return false;
  }
}

/**
 * Records that the user dismissed the update popup for this version in the current session.
 */
export function dismissUpdate(version: string): void {
  if (typeof window === 'undefined' || !version) return;
  try {
    sessionStorage.setItem(`${DISMISSED_UPDATE_PREFIX}${version}`, 'true');
  } catch {
    // Storage error
  }
}
