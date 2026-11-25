import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, type Messaging, type MessagePayload } from 'firebase/messaging';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp | null {
  if (!firebaseConfig.apiKey) return null;
  return !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

let authInstance: Auth | null = null;

export function getFirebaseAuth(): Auth | null {
  if (typeof window === 'undefined') return null;
  const app = getFirebaseApp();
  if (!app) return null;
  if (!authInstance) {
    authInstance = getAuth(app);
  }
  return authInstance;
}

let messagingInstance: Messaging | null = null;

export async function initFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === 'undefined') return null;
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    const supported = await isSupported();
    if (!supported) return null;
    messagingInstance = getMessaging(app);
    return messagingInstance;
  } catch (error) {
    console.error('Firebase Messaging not supported:', error);
    return null;
  }
}

async function waitForActiveServiceWorker(
  registration: ServiceWorkerRegistration
): Promise<ServiceWorkerRegistration> {
  if (registration.active) {
    return registration;
  }

  const worker = registration.installing || registration.waiting;
  if (worker) {
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(resolve, 5000);
      const onStateChange = () => {
        if (worker.state === 'activated' || worker.state === 'redundant') {
          clearTimeout(timeout);
          worker.removeEventListener('statechange', onStateChange);
          resolve();
        }
      };
      worker.addEventListener('statechange', onStateChange);
    });
  }

  if (registration.active) {
    return registration;
  }

  return navigator.serviceWorker.ready;
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return null;
  }

  const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn('[Push] NEXT_PUBLIC_FIREBASE_VAPID_KEY is missing.');
    return null;
  }

  const permission =
    Notification.permission === 'granted'
      ? 'granted'
      : await Notification.requestPermission();
  if (permission !== 'granted') {
    return null;
  }

  const msg = await initFirebaseMessaging();
  if (!msg) return null;

  try {
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });
    // Prompt browser to fetch latest SW immediately if a stale copy is cached
    void registration.update().catch(() => {});
    const activeRegistration = await waitForActiveServiceWorker(registration);

    return await getToken(msg, {
      vapidKey,
      serviceWorkerRegistration: activeRegistration,
    });
  } catch (error) {
    console.error('An error occurred while retrieving token.', error);
    return null;
  }
}

/** Subscribe to foreground FCM messages; returns unsubscribe. */
export async function subscribeToForegroundMessages(
  handler: (payload: MessagePayload) => void
): Promise<(() => void) | null> {
  const msg = messagingInstance ?? (await initFirebaseMessaging());
  if (!msg) return null;

  return onMessage(msg, handler);
}
