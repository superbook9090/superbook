import * as admin from 'firebase-admin';

let initAttempted = false;

function initializeFirebaseAdmin(): void {
  if (initAttempted || admin.apps.length > 0) {
    return;
  }
  initAttempted = true;

  try {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (
      privateKey &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PROJECT_ID
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
          clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
          privateKey,
        }),
      });
    }
  } catch (error) {
    console.error('Firebase Admin initialization error', error);
  }
}

/** Lazily initialize Firebase Admin only when push messaging is actually used. */
export function getAdminMessaging(): admin.messaging.Messaging | null {
  initializeFirebaseAdmin();
  return admin.apps.length > 0 ? admin.messaging() : null;
}

/** Lazily initialize Firebase Admin only when auth is actually used. */
export function getAdminAuth(): admin.auth.Auth | null {
  initializeFirebaseAdmin();
  return admin.apps.length > 0 ? admin.auth() : null;
}
