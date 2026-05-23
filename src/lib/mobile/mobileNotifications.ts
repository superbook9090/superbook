import { registerDeviceToken } from '../notifications/push/registerDevice';
import { registerDeviceToken as registerDeviceTokenApi } from '@/lib/api/notifications';
import { isAndroidWebView, isIOSWebView } from './mobileDetection';
import { sendToWebView, onWebViewMessage } from './webviewBridge';

export const initMobileNotifications = async () => {
  let platform: 'android' | 'ios' | 'web' = 'web';
  if (isAndroidWebView()) platform = 'android';
  else if (isIOSWebView()) platform = 'ios';

  if (platform === 'web') {
    return registerDeviceToken(platform);
  }

  return new Promise<boolean>((resolve) => {
    const cleanup = onWebViewMessage(async (data) => {
      if (data && data.action === 'NATIVE_TOKEN_RECEIVED') {
        cleanup();
        const { token } = data;
        if (token) {
          try {
            await registerDeviceTokenApi({ deviceToken: token, platform });
            resolve(true);
          } catch (e) {
            console.error('Failed to register native token', e);
            resolve(false);
          }
        } else {
          resolve(false);
        }
      }
    });

    sendToWebView('REQUEST_NATIVE_TOKEN');

    setTimeout(() => {
      cleanup();
      resolve(false);
    }, 10000);
  });
};

export const syncBadgeCount = (count: number) => {
  if (isAndroidWebView() || isIOSWebView()) {
    sendToWebView('SET_BADGE_COUNT', { count });
  }
};
