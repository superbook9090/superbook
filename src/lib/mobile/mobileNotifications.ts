import { registerDeviceToken, registerDeviceTokenIfNeeded } from '../notifications/push/registerDevice';
import { isAndroidWebView, isIOSWebView } from './mobileDetection';
import { sendToWebView, onWebViewMessage } from './webviewBridge';

let inFlightRegistration: Promise<boolean> | null = null;
let inFlightUserId: string | null = null;

async function registerForPlatform(userId: string): Promise<boolean> {
  let platform: 'android' | 'ios' | 'web' = 'web';
  if (isAndroidWebView()) platform = 'android';
  else if (isIOSWebView()) platform = 'ios';

  if (platform === 'web') {
    return registerDeviceToken(userId, platform);
  }

  return new Promise<boolean>((resolve) => {
    const cleanup = onWebViewMessage(async (data) => {
      if (data && data.action === 'NATIVE_TOKEN_RECEIVED') {
        cleanup();
        const { token } = data;
        if (token) {
          try {
            await registerDeviceTokenIfNeeded(userId, platform, token);
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

    sendToWebView({ action: 'REQUEST_NATIVE_TOKEN' });

    setTimeout(() => {
      cleanup();
      resolve(false);
    }, 10000);
  });
}

export const initMobileNotifications = async (userId: string): Promise<boolean> => {
  if (inFlightRegistration && inFlightUserId === userId) {
    return inFlightRegistration;
  }

  inFlightUserId = userId;
  inFlightRegistration = registerForPlatform(userId).finally(() => {
    inFlightRegistration = null;
    inFlightUserId = null;
  });

  return inFlightRegistration;
};

export const syncBadgeCount = (count: number) => {
  if (isAndroidWebView() || isIOSWebView()) {
    sendToWebView({ action: 'SET_BADGE_COUNT', payload: { count } });
  }
};
