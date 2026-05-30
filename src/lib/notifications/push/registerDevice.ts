import { registerDeviceToken as registerDeviceTokenApi } from '@/lib/api/notifications';
import { requestNotificationPermission } from './firebase';
import {
  isDeviceRegistered,
  markDeviceRegistered,
} from './deviceRegistrationStorage';

export async function registerDeviceTokenIfNeeded(
  userId: string,
  platform: 'android' | 'ios' | 'web',
  token: string
): Promise<boolean> {
  if (isDeviceRegistered(userId, token, platform)) {
    return true;
  }

  await registerDeviceTokenApi({ deviceToken: token, platform });
  markDeviceRegistered(userId, token, platform);
  return true;
}

export async function registerDeviceToken(userId: string, platform: 'android' | 'ios' | 'web') {
  try {
    const token = await requestNotificationPermission();
    if (!token) {
      return false;
    }

    return registerDeviceTokenIfNeeded(userId, platform, token);
  } catch (error) {
    console.error('Error during token registration:', error);
    return false;
  }
}
