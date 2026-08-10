export type NativeSharePayload = {
  title?: string;
  message?: string;
  url?: string;
};

export type NativeOpenLinkTarget = 'internal' | 'external';

export type WebToNativeMessage =
  | { action: 'REQUEST_NATIVE_TOKEN'; payload?: Record<string, never> }
  | { action: 'REQUEST_SHARE'; payload?: NativeSharePayload }
  | { action: 'REQUEST_OPEN_LINK'; payload: { url: string; target?: NativeOpenLinkTarget } }
  | { action: 'SET_BADGE_COUNT'; payload: { count: number } }
  | { action: 'REQUEST_GOOGLE_SIGN_IN'; payload?: Record<string, never> };

export type NativeToWebMessage =
  | { action: 'NATIVE_TOKEN_RECEIVED'; token: string }
  | { action: 'GOOGLE_NATIVE_TOKEN'; token: string }
  | { action: 'GOOGLE_NATIVE_TOKEN_ERROR'; error: string }
  | { action: 'NATIVE_SHARE_RESULT'; success: boolean; dismissed?: boolean; error?: string }
  | {
      action: 'NATIVE_OPEN_LINK_RESULT';
      success: boolean;
      target?: NativeOpenLinkTarget;
      url?: string;
      error?: string;
    };

export const sendToWebView = (message: WebToNativeMessage) => {
  if (typeof window !== 'undefined') {
    // Check for Android JavascriptInterface
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).AndroidBridge && (window as any).AndroidBridge.postMessage) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).AndroidBridge.postMessage(JSON.stringify(message));
    } 
    // Fallback or generic message posting
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    else if ((window as any).ReactNativeWebView && (window as any).ReactNativeWebView.postMessage) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).ReactNativeWebView.postMessage(JSON.stringify(message));
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

  sendToWebView({ action: 'REQUEST_SHARE', payload });
  return true;
};

export const openLinkViaNativeApp = (url: string, target: NativeOpenLinkTarget = 'external') => {
  if (typeof window === 'undefined') {
    return false;
  }

  if (window.QuizdoNativeApp?.openLink) {
    return window.QuizdoNativeApp.openLink(url, target);
  }

  sendToWebView({ action: 'REQUEST_OPEN_LINK', payload: { url, target } });
  return true;
};

export const openExternalLinkViaNativeApp = (url: string) => openLinkViaNativeApp(url, 'external');

export const openInternalLinkViaNativeApp = (url: string) => openLinkViaNativeApp(url, 'internal');

export const onWebViewMessage = (callback: (data: NativeToWebMessage) => void) => {
  if (typeof window !== 'undefined') {
    const handler = (event: MessageEvent) => {
      try {
        const data = (typeof event.data === 'string' ? JSON.parse(event.data) : event.data) as NativeToWebMessage;
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
