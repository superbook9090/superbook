import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported, type Messaging, type MessagePayload } from 'firebase/messaging';

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

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return null;
  }

  const msg = await initFirebaseMessaging();
  if (!msg) return null;

  try {
    return await getToken(msg, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
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

/** @deprecated Use subscribeToForegroundMessages */
export const onMessageListener = () =>
  new Promise<MessagePayload>((resolve) => {
    if (!messagingInstance) return;
    onMessage(messagingInstance, (payload) => {
      resolve(payload);
    });
  });
