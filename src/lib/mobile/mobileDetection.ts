export const APP_STORAGE_KEY = 'quizdo_is_app';

export const clearMobileAppPersistence = (): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(APP_STORAGE_KEY);
    localStorage.removeItem(APP_STORAGE_KEY);
    if (typeof document !== 'undefined') {
      document.cookie = `${APP_STORAGE_KEY}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  } catch {
    // Storage access might fail in restricted sandboxes
  }
};

export const persistIsMobileApp = (): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(APP_STORAGE_KEY, 'true');
    localStorage.setItem(APP_STORAGE_KEY, 'true');
    if (typeof document !== 'undefined') {
      document.cookie = `${APP_STORAGE_KEY}=true; path=/; max-age=2592000; SameSite=Lax`;
    }
  } catch {
    // Storage access might fail in restricted sandboxes
  }
};

export const isMobileAppUserAgent = (userAgent: string | null | undefined): boolean => {
  if (!userAgent) return false;

  // Exact native app markers (Quizdo native app, React Native WebView, Android WebView custom UA)
  // Must NOT match generic words like "Mobile" or "Android" to prevent false positives on desktop/mobile browsers
  return /QuizdoNativeApp|ReactNativeWebView|QuizdoApp[\/\s_-]|Quizdo[\/\s_-]v?\d|com\.quizdo/i.test(userAgent);
};

export const isAndroidWebView = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';

  return (
    isMobileAppUserAgent(userAgent) ||
    Boolean((window as unknown as { AndroidBridge?: unknown }).AndroidBridge) ||
    Boolean((window as unknown as { Android?: unknown }).Android) ||
    Boolean((window as unknown as { QuizdoApp?: unknown }).QuizdoApp) ||
    Boolean((window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView) ||
    Boolean(window.QuizdoNativeApp?.isNativeApp)
  );
};

export const isIOSWebView = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    Boolean(window.QuizdoNativeApp?.isNativeApp) ||
    Boolean((window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView) ||
    Boolean((window as unknown as { webkit?: { messageHandlers?: { ReactNativeWebView?: unknown } } }).webkit?.messageHandlers?.ReactNativeWebView)
  );
};

export const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Allow explicit opt-out for testing web experience
  if (window.location && window.location.search) {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('app') === 'false' || searchParams.get('web') === 'true') {
      clearMobileAppPersistence();
      return false;
    }
  }

  // 1. Check Native Bridge & Window objects (Most reliable for native app)
  const win = window as unknown as {
    Android?: unknown;
    AndroidBridge?: unknown;
    QuizdoApp?: unknown;
    webkit?: { messageHandlers?: { ReactNativeWebView?: unknown } };
    __REACT_WEB_VIEW__?: unknown;
    ReactNativeWebView?: unknown;
    flutter_inappwebview?: unknown;
    Capacitor?: unknown;
    cordova?: unknown;
    QuizdoNativeApp?: { isNativeApp?: boolean };
  };

  const hasNativeBridge =
    Boolean(win.QuizdoNativeApp?.isNativeApp) ||
    Boolean(win.AndroidBridge) ||
    Boolean(win.Android) ||
    Boolean(win.QuizdoApp) ||
    Boolean(win.ReactNativeWebView) ||
    Boolean(win.webkit?.messageHandlers?.ReactNativeWebView) ||
    Boolean(win.__REACT_WEB_VIEW__) ||
    Boolean(win.flutter_inappwebview) ||
    Boolean(win.Capacitor) ||
    Boolean(win.cordova);

  if (hasNativeBridge) {
    persistIsMobileApp();
    return true;
  }

  // 2. Check URL search parameters
  try {
    if (window.location && window.location.search) {
      const searchParams = new URLSearchParams(window.location.search);
      const hasAppParam =
        searchParams.get('app') === 'true' ||
        searchParams.get('webview') === 'true' ||
        searchParams.get('isApp') === 'true' ||
        searchParams.get('isNative') === 'true' ||
        searchParams.get('platform') === 'app' ||
        searchParams.get('platform') === 'android' ||
        searchParams.get('platform') === 'ios';

      if (hasAppParam) {
        persistIsMobileApp();
        return true;
      }
    }
  } catch {
    // Ignore URL parse error
  }

  // 3. User Agent detection (strict native markers only)
  const userAgent = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || '';
  if (isMobileAppUserAgent(userAgent)) {
    persistIsMobileApp();
    return true;
  }

  // 4. Check active tab session storage
  try {
    if (sessionStorage.getItem(APP_STORAGE_KEY) === 'true') {
      return true;
    }
  } catch {
    // Storage access fallback
  }

  // If none of the native app indicators match, ensure stale localStorage/cookies
  // are cleaned up so normal website visitors in mobile browsers are never trapped!
  clearMobileAppPersistence();
  return false;
};
