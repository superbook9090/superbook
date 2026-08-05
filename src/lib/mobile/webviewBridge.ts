export type NativeSharePayload = {
  title?: string;
  message?: string;
  url?: string;
};

export type NativeOpenLinkTarget = 'internal' | 'external';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sendToWebView = (action: string, payload: any = {}) => {
  if (typeof window !== 'undefined') {
    // Check for Android JavascriptInterface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).AndroidBridge && (window as any).AndroidBridge.postMessage) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).AndroidBridge.postMessage(JSON.stringify({ action, payload }));
    } 
    // Fallback or generic message posting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    else if ((window as any).ReactNativeWebView && (window as any).ReactNativeWebView.postMessage) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).ReactNativeWebView.postMessage(JSON.stringify({ action, payload }));
    }
  }
};

export const isNativeWebViewBridgeAvailable = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return Boolean(
    window.QuizdoNativeApp?.isNativeApp ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).AndroidBridge?.postMessage ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ReactNativeWebView?.postMessage
  );
};

export const shareViaNativeApp = (payload: NativeSharePayload) => {
  if (typeof window === 'undefined') {
    return false;
  }

  if (window.QuizdoNativeApp?.share) {
    return window.QuizdoNativeApp.share(payload);
  }

  sendToWebView('REQUEST_SHARE', payload);
  return true;
};

export const openLinkViaNativeApp = (url: string, target: NativeOpenLinkTarget = 'external') => {
  if (typeof window === 'undefined') {
    return false;
  }

  if (window.QuizdoNativeApp?.openLink) {
    return window.QuizdoNativeApp.openLink(url, target);
  }

  sendToWebView('REQUEST_OPEN_LINK', { url, target });
  return true;
};

export const openExternalLinkViaNativeApp = (url: string) => openLinkViaNativeApp(url, 'external');

export const openInternalLinkViaNativeApp = (url: string) => openLinkViaNativeApp(url, 'internal');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const onWebViewMessage = (callback: (data: any) => void) => {
  if (typeof window !== 'undefined') {
    const handler = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        callback(data);
      } catch (e) {
        console.error("Failed to parse message", e);
      }
    };
    window.addEventListener('message', handler);
    // Cleanup function
    return () => window.removeEventListener('message', handler);
  }
  return () => {};
};
