import { registerDeviceToken as registerDeviceTokenApi } from '@/lib/api/notifications';
import { requestNotificationPermission } from './firebase';

export async function registerDeviceToken(platform: 'android' | 'ios' | 'web') {
  try {
    const token = await requestNotificationPermission();
    if (!token) {
      return false;
    }

    await registerDeviceTokenApi({ deviceToken: token, platform });
    return true;
  } catch (error) {
    console.error('Error during token registration:', error);
    return false;
  }
}
