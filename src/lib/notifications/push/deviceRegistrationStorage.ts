type PushPlatform = 'android' | 'ios' | 'web';

type StoredRegistration = {
  userId: string;
  deviceToken: string;
  platform: PushPlatform;
};

const STORAGE_KEY = 'pushDeviceRegistration';

function readStoredRegistration(): StoredRegistration | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredRegistration;
  } catch {
    return null;
  }
}

export function isDeviceRegistered(userId: string, deviceToken: string, platform: PushPlatform): boolean {
  const stored = readStoredRegistration();
  return (
    stored?.userId === userId &&
    stored.deviceToken === deviceToken &&
    stored.platform === platform
  );
}

export function markDeviceRegistered(userId: string, deviceToken: string, platform: PushPlatform): void {
  if (typeof window === 'undefined') return;
  const payload: StoredRegistration = { userId, deviceToken, platform };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function clearStoredDeviceRegistration(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}
