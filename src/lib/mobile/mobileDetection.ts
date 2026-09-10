export const APP_STORAGE_KEY = 'quizdo_is_app';

export const persistIsMobileApp = (): void => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(APP_STORAGE_KEY, 'true');
    localStorage.setItem(APP_STORAGE_KEY, 'true');
    if (typeof document !== 'undefined') {
      document.cookie = `${APP_STORAGE_KEY}=true; path=/; max-age=31536000; SameSite=Lax`;
    }
  } catch {
    // Storage access might fail in restricted sandboxes
  }
};

export const isMobileAppUserAgent = (userAgent: string | null | undefined): boolean => {
  if (!userAgent) return false;

  // Custom native app markers (e.g. Quizdo native app, React Native WebView, SuperBook, etc.)
  if (/QuizdoNativeApp|ReactNativeWebView|QuizdoApp|Quizdo|SuperBookApp|SuperBook|MobileApp/i.test(userAgent)) {
    return true;
  }

  // Common in-app browsers
  if (/FBAN|FBAV|Instagram|Twitter|Line|LinkedIn|MicroMessenger|Snapchat/i.test(userAgent)) {
    return true;
  }

  // Basic Android WebView detection via UA
  const isAndroid = /android/i.test(userAgent);
  if (isAndroid && (/(Version\/\d+\.\d+)/i.test(userAgent) || /wv/i.test(userAgent) || /Crosswalk/i.test(userAgent))) {
    return true;
  }

  // Basic iOS WebView detection via UA (iOS + not standard Safari)
  const isIOS = /iPad|iPhone|iPod/i.test(userAgent) && !/MSStream/.test(userAgent);
  const isSafari = /Safari/i.test(userAgent);
  if (isIOS && !isSafari) {
    return true;
  }

  return false;
};

export const isAndroidWebView = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';

  return (
    isMobileAppUserAgent(userAgent) ||
    Boolean(window.AndroidBridge) ||
    Boolean((window as unknown as { Android?: unknown }).Android) ||
    Boolean(window.ReactNativeWebView) ||
    Boolean(window.QuizdoNativeApp?.isNativeApp)
  );
};

export const isIOSWebView = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';

  const isIOS = /iPad|iPhone|iPod/i.test(userAgent) && !window.MSStream;
  const isSafari = /Safari/i.test(userAgent);

  return (
    (isIOS && !isSafari) ||
    Boolean(window.QuizdoNativeApp?.isNativeApp) ||
    Boolean(window.ReactNativeWebView) ||
    Boolean((window as unknown as { webkit?: { messageHandlers?: { ReactNativeWebView?: unknown } } }).webkit?.messageHandlers?.ReactNativeWebView)
  );
};

export const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;

  // 1. Check cached detection in storage / cookies
  try {
    if (
      sessionStorage.getItem(APP_STORAGE_KEY) === 'true' ||
      localStorage.getItem(APP_STORAGE_KEY) === 'true' ||
      (typeof document !== 'undefined' && document.cookie.includes(`${APP_STORAGE_KEY}=true`))
    ) {
      return true;
    }
  } catch {
    // Storage access might fail in restricted sandboxes
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
        searchParams.get('platform') === 'mobile' ||
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

  // 3. Check Native Bridge & Window objects
  const win = window as unknown as {
    Android?: unknown;
    webkit?: { messageHandlers?: unknown };
    __REACT_WEB_VIEW__?: unknown;
    flutter_inappwebview?: unknown;
    Capacitor?: unknown;
    cordova?: unknown;
  };

  const hasNativeBridge =
    Boolean(window.QuizdoNativeApp?.isNativeApp) ||
    Boolean(window.AndroidBridge) ||
    Boolean(win.Android) ||
    Boolean(window.ReactNativeWebView) ||
    Boolean(win.webkit?.messageHandlers) ||
    Boolean(win.__REACT_WEB_VIEW__) ||
    Boolean(win.flutter_inappwebview) ||
    Boolean(win.Capacitor) ||
    Boolean(win.cordova);

  if (hasNativeBridge) {
    persistIsMobileApp();
    return true;
  }

  // 4. Standalone PWA / installed WebAPK display modes
  try {
    const isStandalone =
      Boolean(window.matchMedia?.('(display-mode: standalone)').matches) ||
      Boolean(window.matchMedia?.('(display-mode: fullscreen)').matches) ||
      Boolean(window.matchMedia?.('(display-mode: minimal-ui)').matches) ||
      Boolean((navigator as unknown as { standalone?: boolean }).standalone) ||
      Boolean(typeof document !== 'undefined' && document.referrer && document.referrer.startsWith('android-app://'));

    if (isStandalone) {
      persistIsMobileApp();
      return true;
    }
  } catch {
    // MatchMedia error fallback
  }

  // 5. User Agent detection
  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
  if (isMobileAppUserAgent(userAgent)) {
    persistIsMobileApp();
    return true;
  }

  // 6. Check platform sub-helpers
  if (isAndroidWebView() || isIOSWebView()) {
    persistIsMobileApp();
    return true;
  }

  return false;
};



