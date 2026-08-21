import type { NativeOpenLinkTarget, NativeSharePayload } from '@/lib/mobile/webviewBridge';

declare global {
  interface Window {
    AndroidBridge?: {
      postMessage?: (message: string) => void;
    };
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
    opera?: string;
    MSStream?: unknown;
  }
}

export {};

