import type { NativeOpenLinkTarget, NativeSharePayload } from '@/lib/mobile/webviewBridge';

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
    QuizdoNativeApp?: {
      isNativeApp: boolean;
      share: (payload: NativeSharePayload) => boolean;
      openLink: (url: string, target?: NativeOpenLinkTarget) => boolean;
      openExternal: (url: string) => boolean;
      openInternal: (url: string) => boolean;
    };
  }
}

export {};
