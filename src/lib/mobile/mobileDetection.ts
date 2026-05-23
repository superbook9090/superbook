export const isAndroidWebView = () => {
  if (typeof window === 'undefined') return false;
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  
  // Basic Android WebView detection
  // Usually contains 'wv' in the user agent string for newer versions
  // Or 'Version/x.x' for older versions + 'Android'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return /android/i.test(userAgent) && (/(Version\/\d+.\d+)/.test(userAgent) || /wv/.test(userAgent) || (window as any).AndroidBridge);
};

export const isIOSWebView = () => {
  if (typeof window === 'undefined') return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
  // Simple check for iOS + not Safari (Safari usually doesn't have the webkit/safari match exactly in webviews like WKWebView without specific user agent changes)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream;
  const isSafari = /Safari/i.test(userAgent);
  return isIOS && !isSafari;
};

export const isMobileApp = () => isAndroidWebView() || isIOSWebView();
