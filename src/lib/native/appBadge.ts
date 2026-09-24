/**
 * PWA Badging API helper.
 * Displays unread notifications or live contest indicators on mobile app icons.
 */

export function isAppBadgeSupported(): boolean {
  return typeof navigator !== 'undefined' && 'setAppBadge' in navigator;
}

export async function setAppBadge(count?: number): Promise<boolean> {
  if (!isAppBadgeSupported()) return false;
  try {
    if (typeof count === 'number' && count > 0) {
      await navigator.setAppBadge(count);
    } else {
      await navigator.setAppBadge();
    }
    return true;
  } catch (err) {
    console.debug('[AppBadge] Failed to set badge:', err);
    return false;
  }
}

export async function clearAppBadge(): Promise<boolean> {
  if (!isAppBadgeSupported()) return false;
  try {
    await navigator.clearAppBadge();
    return true;
  } catch (err) {
    console.debug('[AppBadge] Failed to clear badge:', err);
    return false;
  }
}
