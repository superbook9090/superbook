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
 * Extracts app version from a user agent string.
 * Matches patterns like "QuizdoApp/1.2.0", "QuizdoNativeApp/1.0.4", "QuizdoApp_v2.0".
 */
export function extractVersionFromUserAgent(ua: string | null | undefined): string | null {
  if (!ua) return null;
  const match = ua.match(/(?:QuizdoNativeApp|QuizdoApp)[\/_v]?(\d+(\.\d+)+)/i);
  return match ? match[1] : null;
}

/**
 * Detects the currently running mobile app version.
 * Checks bridge interfaces, URL query params, user-agent, and persistent storage.
 */
export function getCurrentAppVersion(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check URL query parameters (useful during testing or when WebView initial URL passes it)
  try {
    if (window.location && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const queryVersion =
        params.get('appVersion') ||
        params.get('version') ||
        params.get('app_version') ||
        params.get('v');

      if (queryVersion && /^\d+(\.\d+)*/.test(queryVersion)) {
        persistCurrentAppVersion(queryVersion);
        return queryVersion;
      }
    }
  } catch {
    // URL parsing fallback
  }

  // 2. Check Native Bridge Window properties & methods
  try {
    const bridge = window.QuizdoNativeApp;
    if (bridge) {
      const bridgeVersion =
        bridge.appVersion ||
        bridge.version ||
        (typeof bridge.getAppVersion === 'function' ? bridge.getAppVersion() : null);

      if (bridgeVersion && typeof bridgeVersion === 'string') {
        persistCurrentAppVersion(bridgeVersion);
        return bridgeVersion;
      }
    }

    const androidBridge = window.AndroidBridge;
    if (androidBridge) {
      const androidVersion =
        androidBridge.appVersion ||
        (typeof androidBridge.getAppVersion === 'function' ? androidBridge.getAppVersion() : null);

      if (androidVersion && typeof androidVersion === 'string') {
        persistCurrentAppVersion(androidVersion);
        return androidVersion;
      }
    }
  } catch {
    // Bridge call fallback
  }

  // 3. Check User Agent
  const ua = navigator.userAgent || navigator.vendor || '';
  const uaVersion = extractVersionFromUserAgent(ua);
  if (uaVersion) {
    persistCurrentAppVersion(uaVersion);
    return uaVersion;
  }

  // 4. Check persistent storage
  try {
    const stored =
      sessionStorage.getItem(APP_VERSION_STORAGE_KEY) ||
      localStorage.getItem(APP_VERSION_STORAGE_KEY);
    if (stored) {
      return stored;
    }
  } catch {
    // Storage access fallback
  }

  // 5. If running inside the mobile app shell but no version was explicitly identified,
  // assume baseline "1.0.0" so update checking can still function
  if (isMobileApp()) {
    return '1.0.0';
  }

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
