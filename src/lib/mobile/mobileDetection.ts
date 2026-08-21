export const isMobileAppUserAgent = (userAgent: string | null | undefined): boolean => {
  if (!userAgent) return false;

  // Custom native app markers (e.g. Quizdo native app, React Native WebView, etc.)
  if (/QuizdoNativeApp|ReactNativeWebView|QuizdoApp|MobileApp/i.test(userAgent)) {
    return true;
  }

  // Basic Android WebView detection via UA
  const isAndroid = /android/i.test(userAgent);
  if (isAndroid && (/(Version\/\d+.\d+)/.test(userAgent) || /wv/.test(userAgent))) {
    return true;
  }

  // Basic iOS WebView detection via UA (iOS + not Safari)
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !/MSStream/.test(userAgent);
  const isSafari = /Safari/i.test(userAgent);
  if (isIOS && !isSafari) {
    return true;
  }

  return false;
};

export const isAndroidWebView = () => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';

  return (
    isMobileAppUserAgent(userAgent) ||
    Boolean(window.AndroidBridge) ||
    Boolean(window.ReactNativeWebView) ||
    Boolean(window.QuizdoNativeApp?.isNativeApp)
  );
};

export const isIOSWebView = () => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';

  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  const isSafari = /Safari/i.test(userAgent);

  return (
    (isIOS && !isSafari) ||
    Boolean(window.QuizdoNativeApp?.isNativeApp) ||
    Boolean(window.ReactNativeWebView)
  );
};

export const isMobileApp = () => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';

  return (
    isMobileAppUserAgent(userAgent) ||
    isAndroidWebView() ||
    isIOSWebView() ||
    Boolean(window.QuizdoNativeApp?.isNativeApp) ||
    Boolean(window.AndroidBridge) ||
    Boolean(window.ReactNativeWebView)
  );
};


