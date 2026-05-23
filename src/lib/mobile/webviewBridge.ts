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
